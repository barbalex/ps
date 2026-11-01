import {
  operationsQueueAtom,
  pgliteDbAtom,
  postgrestClientAtom,
  store,
  syncObjectAtom,
} from '../store.ts'
import { fetchPostgrestToken } from './fetchPostgrestToken.ts'
import { notifyAllLiveTables } from './gateLiveNotifyTriggers.ts'
import { hasAggregatedUpdates } from './operationAggregation.ts'

// queued or still-buffered local writes: both must reach the server before
// pruning local rows out of the sync scope
const hasPendingWrites = () =>
  store.get(operationsQueueAtom).length > 0 || hasAggregatedUpdates()

/**
 * Drops local rows that left the user's sync scope.
 *
 * Electric reports rows leaving a subquery shape (a role was revoked) as
 * move-out events, which pglite-sync does not apply: the revoked project's
 * rows would stay in the local database. This asks the server for the ids
 * the shapes are currently scoped to (sync_scope(), mirroring the shape
 * where clauses) and deletes the local projects/subprojects/places outside
 * that scope; their children go with them through the local FK cascades.
 */

type SyncScope = {
  project_ids: string[]
  subproject_ids: string[]
  place_ids: string[]
}

export type PrunedCounts = {
  projects: number
  subprojects: number
  places: number
}

const fetchSyncScope = async (): Promise<SyncScope> => {
  const postgrestClient = store.get(postgrestClientAtom)
  if (!postgrestClient) throw new Error('No PostgREST client available')
  const token = await fetchPostgrestToken()
  const builder = postgrestClient.rpc('sync_scope')
  if (token) builder.setHeader('Authorization', `Bearer ${token}`)
  const { data, error } = await builder
  if (error) {
    throw Object.assign(new Error(error.message ?? 'sync_scope failed'), {
      code: error.code,
    })
  }
  const scope = data as Partial<SyncScope> | null
  if (
    !Array.isArray(scope?.project_ids) ||
    !Array.isArray(scope?.subproject_ids) ||
    !Array.isArray(scope?.place_ids)
  ) {
    throw new Error('sync_scope returned an unexpected payload')
  }
  return scope as SyncScope
}

/**
 * Returns the pruned counts, or null when reconciling is not safe right now:
 * sync not settled (a re-snapshot may have the tables half-filled) or local
 * writes still queued (a project created offline is not in the server scope
 * until its insert is applied — that includes edits still buffered by the
 * update aggregation).
 */
export const reconcileSyncScope = async (): Promise<PrunedCounts | null> => {
  const db = store.get(pgliteDbAtom)
  const sync = store.get(syncObjectAtom) as { isUpToDate?: boolean } | null
  if (!db || !sync?.isUpToDate) return null
  if (hasPendingWrites()) return null

  const scope = await fetchSyncScope()

  // re-check after the round trip
  if (!store.get(syncObjectAtom) || hasPendingWrites()) return null

  const counts = await db.transaction(async (tx) => {
    // same escape hatch pglite-sync uses: no history/audit triggers, no
    // live-query notifications per statement
    await tx.exec(`SET LOCAL electric.syncing = true;`)
    const projects = await tx.query(
      `DELETE FROM projects WHERE project_id <> ALL($1::uuid[])`,
      [scope.project_ids],
    )
    const subprojects = await tx.query(
      `DELETE FROM subprojects WHERE subproject_id <> ALL($1::uuid[])`,
      [scope.subproject_ids],
    )
    const places = await tx.query(
      `DELETE FROM places WHERE place_id <> ALL($1::uuid[])`,
      [scope.place_ids],
    )
    return {
      projects: projects.affectedRows ?? 0,
      subprojects: subprojects.affectedRows ?? 0,
      places: places.affectedRows ?? 0,
    }
  })

  if (counts.projects + counts.subprojects + counts.places > 0) {
    console.log('reconcileSyncScope: pruned rows outside sync scope', counts)
    await notifyAllLiveTables(db).catch(() => undefined)
  }
  return counts
}
