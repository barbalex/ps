import { useEffect, useMemo, useRef } from 'react'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom, useAtomValue } from 'jotai'

import {
  initialSyncingAtom,
  seenWfsServiceKeysAtom,
  seenWmsServiceKeysAtom,
  sqlInitializingAtom,
} from '../store.ts'
import { backgroundTasks } from '../modules/backgroundTasks.ts'
import { getWmsCapabilitiesData } from '../formsAndLists/wmsLayer/Form/CreateWmsService/getWmsCapabilitiesData.ts'
import { getWfsCapabilitiesData } from '../formsAndLists/vectorLayer/Form/getWfsCapabilitiesData.ts'

export const AutoFetchCapabilities = () => {
  const db = usePGlite()
  const initialSyncing = useAtomValue(initialSyncingAtom)
  const sqlInitializing = useAtomValue(sqlInitializingAtom)
  const [seenWmsKeys, setSeenWmsKeys] = useAtom(seenWmsServiceKeysAtom)
  const [seenWfsKeys, setSeenWfsKeys] = useAtom(seenWfsServiceKeysAtom)
  const inFlightRef = useRef(new Set<string>())

  const wmsRes = useLiveQuery(
    `SELECT wms_service_id, url, project_id FROM wms_services`,
    [],
  )
  const wfsRes = useLiveQuery(
    `SELECT wfs_service_id, url, project_id FROM wfs_services`,
    [],
  )

  const wmsServices = useMemo(() => wmsRes?.rows ?? [], [wmsRes?.rows])
  const wfsServices = useMemo(() => wfsRes?.rows ?? [], [wfsRes?.rows])

  useEffect(() => {
    if (sqlInitializing || initialSyncing) return
    if (!db || !wmsServices.length) return

    const run = async () => {
      const seenToAdd: string[] = []
      const pendingServices = wmsServices.filter((service) => {
        const url = service.url?.trim?.()
        if (!url) return false
        const key = `${service.wms_service_id}|${url}`
        return !seenWmsKeys.includes(key)
      })
      const taskId = 'auto-fetch-wms-capabilities'

      if (pendingServices.length) {
        backgroundTasks.add(
          taskId,
          'Fetching WMS capabilities',
          pendingServices.length,
        )
      }
      let progress = 0

      for (const service of pendingServices) {
        const url = service.url?.trim?.()
        if (!url) continue
        const key = `${service.wms_service_id}|${url}`
        const inFlightKey = `wms:${key}`
        if (seenWmsKeys.includes(key) || inFlightRef.current.has(inFlightKey)) {
          continue
        }

        inFlightRef.current.add(inFlightKey)
        try {
          const res = await db.query(
            `SELECT count(*) AS count FROM wms_service_layers WHERE wms_service_id = $1`,
            [service.wms_service_id],
          )
          const count = Number(res?.rows?.[0]?.count ?? 0)
          if (count === 0) {
            await getWmsCapabilitiesData({
              wmsLayer: {
                wms_layer_id: null,
                wms_service_id: service.wms_service_id,
                project_id: service.project_id,
              },
              service: { ...service, url },
            })
          }
          seenToAdd.push(key)
          progress += 1
          if (pendingServices.length) {
            backgroundTasks.updateProgress(taskId, progress)
          }
        } catch (error) {
          console.error('AutoFetchCapabilities: WMS fetch failed', error)
          if (pendingServices.length) {
            backgroundTasks.error(
              taskId,
              'Failed to fetch some WMS capabilities',
            )
          }
        } finally {
          inFlightRef.current.delete(inFlightKey)
        }
      }

      if (seenToAdd.length) {
        const merged = [...new Set([...seenWmsKeys, ...seenToAdd])]
        setSeenWmsKeys(merged)
      }

      if (pendingServices.length) {
        backgroundTasks.complete(taskId)
      }
    }

    run()
  }, [
    db,
    initialSyncing,
    sqlInitializing,
    wmsServices,
    seenWmsKeys,
    setSeenWmsKeys,
  ])

  useEffect(() => {
    if (sqlInitializing || initialSyncing) return
    if (!db || !wfsServices.length) return

    const run = async () => {
      const seenToAdd: string[] = []
      const pendingServices = wfsServices.filter((service) => {
        const url = service.url?.trim?.()
        if (!url) return false
        const key = `${service.wfs_service_id}|${url}`
        return !seenWfsKeys.includes(key)
      })
      const taskId = 'auto-fetch-wfs-capabilities'

      if (pendingServices.length) {
        backgroundTasks.add(
          taskId,
          'Fetching WFS capabilities',
          pendingServices.length,
        )
      }
      let progress = 0

      for (const service of pendingServices) {
        const url = service.url?.trim?.()
        if (!url) continue
        const key = `${service.wfs_service_id}|${url}`
        const inFlightKey = `wfs:${key}`
        if (seenWfsKeys.includes(key) || inFlightRef.current.has(inFlightKey)) {
          continue
        }

        inFlightRef.current.add(inFlightKey)
        try {
          const res = await db.query(
            `SELECT count(*) AS count FROM wfs_service_layers WHERE wfs_service_id = $1`,
            [service.wfs_service_id],
          )
          const count = Number(res?.rows?.[0]?.count ?? 0)
          if (count === 0) {
            await getWfsCapabilitiesData({
              vectorLayer: {
                vector_layer_id: null,
                wfs_service_id: service.wfs_service_id,
                project_id: service.project_id,
                wfs_service_layer_name: null,
              },
              service: { ...service, url },
            })
          }
          seenToAdd.push(key)
          progress += 1
          if (pendingServices.length) {
            backgroundTasks.updateProgress(taskId, progress)
          }
        } catch (error) {
          console.error('AutoFetchCapabilities: WFS fetch failed', error)
          if (pendingServices.length) {
            backgroundTasks.error(
              taskId,
              'Failed to fetch some WFS capabilities',
            )
          }
        } finally {
          inFlightRef.current.delete(inFlightKey)
        }
      }

      if (seenToAdd.length) {
        const merged = [...new Set([...seenWfsKeys, ...seenToAdd])]
        setSeenWfsKeys(merged)
      }

      if (pendingServices.length) {
        backgroundTasks.complete(taskId)
      }
    }

    run()
  }, [
    db,
    initialSyncing,
    sqlInitializing,
    wfsServices,
    seenWfsKeys,
    setSeenWfsKeys,
  ])

  return null
}
