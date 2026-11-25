import { useEffect, useMemo, useRef } from 'react'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useAtomValue } from 'jotai'

import { initialSyncingAtom, sqlInitializingAtom } from '../store.ts'
import {
  fetchPendingCapabilities,
  seenWmsKey,
  seenWfsKey,
} from '../modules/autoFetchCapabilities.ts'
import { getWmsCapabilitiesData } from '../formsAndLists/wmsLayer/Form/CreateWmsService/getWmsCapabilitiesData.ts'
import { getWfsCapabilitiesData } from '../formsAndLists/vectorLayer/Form/getWfsCapabilitiesData.ts'

// Fetches capabilities on every app load for services that sync in without
// layers (created on another device or by another user) — once per browser
// per service, see modules/autoFetchCapabilities.ts

export const AutoFetchCapabilities = () => {
  const db = usePGlite()
  const initialSyncing = useAtomValue(initialSyncingAtom)
  const sqlInitializing = useAtomValue(sqlInitializingAtom)
  const inFlightRef = useRef(new Set<string>())

  const wmsRes = useLiveQuery<{
    wms_service_id: string
    url: string | null
    project_id: string
  }>(
    `SELECT wms_service_id, url, project_id FROM wms_services`,
    [],
  )
  const wfsRes = useLiveQuery<{
    wfs_service_id: string
    url: string | null
    project_id: string
  }>(
    `SELECT wfs_service_id, url, project_id FROM wfs_services`,
    [],
  )

  const wmsServices = useMemo(() => wmsRes?.rows ?? [], [wmsRes?.rows])
  const wfsServices = useMemo(() => wfsRes?.rows ?? [], [wfsRes?.rows])

  useEffect(() => {
    if (sqlInitializing || initialSyncing) return
    if (!db || !wmsServices.length) return

    void fetchPendingCapabilities({
      db,
      inFlight: inFlightRef.current,
      taskId: 'auto-fetch-wms-capabilities',
      taskName: 'Fetching WMS capabilities',
      failureMessage: 'Failed to fetch some WMS capabilities',
      layerTable: 'wms_service_layers',
      serviceIdColumn: 'wms_service_id',
      services: wmsServices
        .map((service) => ({
          id: service.wms_service_id,
          url: service.url?.trim?.() ?? '',
          projectId: service.project_id,
        }))
        .filter((service) => service.url),
      seenKeyOf: (service) => seenWmsKey(service.id, service.url),
      fetchCapabilities: (service) =>
        getWmsCapabilitiesData({
          wmsLayer: {
            wms_layer_id: null,
            wms_service_id: service.id,
            project_id: service.projectId,
          },
          service: {
            wms_service_id: service.id,
            url: service.url,
            project_id: service.projectId,
          },
        } as unknown as Parameters<typeof getWmsCapabilitiesData>[0]),
    })
  }, [db, initialSyncing, sqlInitializing, wmsServices])

  useEffect(() => {
    if (sqlInitializing || initialSyncing) return
    if (!db || !wfsServices.length) return

    void fetchPendingCapabilities({
      db,
      inFlight: inFlightRef.current,
      taskId: 'auto-fetch-wfs-capabilities',
      taskName: 'Fetching WFS capabilities',
      failureMessage: 'Failed to fetch some WFS capabilities',
      layerTable: 'wfs_service_layers',
      serviceIdColumn: 'wfs_service_id',
      services: wfsServices
        .map((service) => ({
          id: service.wfs_service_id,
          url: service.url?.trim?.() ?? '',
          projectId: service.project_id,
        }))
        .filter((service) => service.url),
      seenKeyOf: (service) => seenWfsKey(service.id, service.url),
      fetchCapabilities: (service) =>
        getWfsCapabilitiesData({
          vectorLayer: {
            vector_layer_id: null,
            wfs_service_id: service.id,
            project_id: service.projectId,
            wfs_service_layer_name: null,
          },
          service: {
            wfs_service_id: service.id,
            url: service.url,
            project_id: service.projectId,
          },
        } as unknown as Parameters<typeof getWfsCapabilitiesData>[0]),
    })
  }, [db, initialSyncing, sqlInitializing, wfsServices])

  return null
}
