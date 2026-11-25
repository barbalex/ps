import type { PGliteWithLive } from '@electric-sql/pglite/live'

import { backgroundTasks } from './backgroundTasks.ts'
import { NetworkError } from './httpGet.ts'

/**
 * AutoFetchCapabilities' engine: on every app load, fetch capabilities for
 * WMS/WFS services that sync in without layers (created on another device or
 * by another user) — once per browser per service.
 *
 * Which services were already fetched (or failed terminally) is tracked in
 * the local-only _ps_local_meta table instead of localStorage: per-key
 * upserts cannot overwrite each other from stale closures (with the former
 * seen-keys atom arrays, two pending services on one load could lose one key
 * and re-fetch it on every following load), and logout wipes the database
 * together with the markers.
 */

export const seenWmsKey = (wmsServiceId: string, url: string) =>
  `seen_wms_service:${wmsServiceId}|${url}`
export const seenWfsKey = (wfsServiceId: string, url: string) =>
  `seen_wfs_service:${wfsServiceId}|${url}`

export type ServiceToFetch = { id: string; url: string; projectId: string }

// only db.query is used: plain PGlite (tests) and PGliteWithLive (the app's
// usePGlite) both fit
type QueryRunner = Pick<PGliteWithLive, 'query'>

const markSeen = async (db: QueryRunner, key: string) => {
  await db.query(
    `INSERT INTO _ps_local_meta (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
    [key, new Date().toISOString()],
  )
}

export const fetchPendingCapabilities = async ({
  db,
  inFlight,
  taskId,
  taskName,
  failureMessage,
  layerTable,
  serviceIdColumn,
  services,
  seenKeyOf,
  fetchCapabilities,
}: {
  db: QueryRunner
  inFlight: Set<string>
  taskId: string
  taskName: string
  failureMessage: string
  layerTable: 'wms_service_layers' | 'wfs_service_layers'
  serviceIdColumn: 'wms_service_id' | 'wfs_service_id'
  services: ServiceToFetch[]
  seenKeyOf: (service: ServiceToFetch) => string
  fetchCapabilities: (service: ServiceToFetch) => Promise<unknown>
}) => {
  if (!services.length) return

  try {
    // snapshot for the pending list and the task's total; the loop re-checks
    // seen per service, so a fetch another run or tab finished meanwhile is
    // not repeated
    const seenRes = await db.query<{ key: string }>(
      `SELECT key FROM _ps_local_meta WHERE key IN (${services
        .map((_, index) => `$${index + 1}`)
        .join(',')})`,
      services.map(seenKeyOf),
    )
    const seenAtStart = new Set(seenRes.rows.map((row) => row.key))
    const pendingServices = services.filter(
      (service) => !seenAtStart.has(seenKeyOf(service)),
    )

    if (pendingServices.length) {
      backgroundTasks.add(taskId, taskName, pendingServices.length)
    }
    let progress = 0

    for (const service of pendingServices) {
      const key = seenKeyOf(service)
      if (inFlight.has(key)) continue
      inFlight.add(key)
      try {
        const res = await db.query<{
          layer_count: number | string
          seen: number | string
        }>(
          `SELECT
             (SELECT count(*) FROM ${layerTable} WHERE ${serviceIdColumn} = $1) AS layer_count,
             (SELECT count(*) FROM _ps_local_meta WHERE key = $2) AS seen`,
          [service.id, key],
        )
        const hasLayers = Number(res?.rows?.[0]?.layer_count ?? 0) > 0
        const seen = Number(res?.rows?.[0]?.seen ?? 0) > 0
        if (!seen && !hasLayers) {
          await fetchCapabilities(service)
        }
        await markSeen(db, key)
        progress += 1
        if (pendingServices.length) {
          backgroundTasks.updateProgress(taskId, progress)
        }
      } catch (error) {
        console.error(`AutoFetchCapabilities: ${taskId} failed`, error)
        if (pendingServices.length) {
          backgroundTasks.error(taskId, failureMessage)
        }
        // network errors (NetworkError from httpGet: offline, DNS,
        // CORS-blocked) are transient — keep retrying those. Anything else
        // (http error status, unparseable capabilities, a crash while
        // processing them) is terminal: mark the service seen or every
        // reload retries the fetch forever
        if (!(error instanceof NetworkError)) {
          try {
            await markSeen(db, key)
          } catch (markError) {
            console.error(
              'AutoFetchCapabilities: marking service seen failed',
              markError,
            )
          }
        }
      } finally {
        inFlight.delete(key)
      }
    }

    if (pendingServices.length) {
      backgroundTasks.complete(taskId)
    }
  } catch (error) {
    // e.g. _ps_local_meta missing: never leave an unhandled rejection behind
    console.error('AutoFetchCapabilities: run failed', error)
  }
}
