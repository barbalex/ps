import { createWorkerFactory, useWorker } from '@shopify/react-web-worker'
import { Button, Spinner } from '@fluentui/react-components'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createWfsService } from '../../../modules/createRows.ts'
import {
  addOperationAtom,
  addNotificationAtom,
  updateNotificationAtom,
} from '../../../store.ts'

const createWorker = createWorkerFactory(
  () => import('./getWfsCapabilitiesData.ts'),
)

const buttonStyle = {
  minHeight: 32,
}

export const FetchWfsCapabilities = ({
  vectorLayer,
  url,
  fetching,
  setFetching,
}) => {
  const db = usePGlite()
  const worker = useWorker(createWorker)
  const addOperation = useSetAtom(addOperationAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const updateNotification = useSetAtom(updateNotificationAtom)

  const res = useLiveQuery(
    `SELECT count(*) FROM wfs_service_layers WHERE wfs_service_id = $1`,
    [vectorLayer.wfs_service_id],
  )
  const wfsServiceLayersCount = res?.rows?.[0]?.count ?? 0

  const onFetchCapabilities = async () => {
    const urlTrimmed = url?.trim?.()
    if (!urlTrimmed) return

    // 1. check if wfs_service exists for this url
    const eSRes = await db.query(`SELECT * FROM wfs_services WHERE url = $1`, [
      urlTrimmed,
    ])
    const existingService = eSRes?.rows?.[0]
    let service
    if (existingService) {
      // 2. if so, update it
      service = { ...existingService }
      // and remove its layers to be recreated
      await db.query(
        `DELETE FROM wfs_service_layers WHERE wfs_service_id = $1`,
        [service.wfs_service_id],
      )
      addOperation({
        table: 'wfs_service_layers',
        filter: { wfs_service_id: service.wfs_service_id },
        operation: 'delete',
      })

      // ensure vectorLayer.wfs_service_id is set
      await db.query(
        `UPDATE vector_layers SET wfs_service_id = $1 WHERE vector_layer_id = $2`,
        [service.wfs_service_id, vectorLayer.vector_layer_id],
      )
      addOperation({
        table: 'vector_layers',
        rowIdName: 'vector_layer_id',
        rowId: vectorLayer.vector_layer_id,
        operation: 'update',
        draft: { wfs_service_id: service.wfs_service_id },
      })
    } else {
      // 3. if not, create service, then update that
      const serviceData = await createWfsService({
        url: urlTrimmed,
        projectId: vectorLayer.project_id,
        db,
      })
      try {
        await db.query(
          `UPDATE vector_layers SET wfs_service_id = $1 WHERE vector_layer_id = $2`,
          [serviceData.wfs_service_id, vectorLayer.vector_layer_id],
        )
      } catch (error) {
        console.error('FetchCapabilities.onFetchCapabilities 3', error)
      }
      addOperation({
        table: 'vector_layers',
        rowIdName: 'vector_layer_id',
        rowId: vectorLayer.vector_layer_id,
        operation: 'update',
        draft: { wfs_service_id: serviceData.wfs_service_id },
      })
      service = { ...serviceData }
    }

    // show loading indicator
    setFetching(true)
    const notificationId = await addNotification({
      title: `Loading capabilities for ${urlTrimmed}`,
      intent: 'info',
      paused: true,
    })

    // fetch capabilities
    try {
      await worker.getWfsCapabilitiesData({
        vectorLayer,
        service,
        db,
      })
    } catch (error) {
      console.error(
        'hello WmsBaseUrl, onBlur, error getting capabilities data:',
        error?.message ?? error,
      )
      // surface error to user
      await addNotification({
        title: `Error loading capabilities for ${urlTrimmed}`,
        body: error?.message ?? error,
        intent: 'error',
        paused: false,
      })
    }
    setFetching(false)
    updateNotification(notificationId, {
      title: `Loaded capabilities for ${urlTrimmed}`,
      intent: 'success',
      paused: false,
      timeout: 500,
    })
  }

  return (
    <Button
      icon={fetching ? <Spinner size="tiny" /> : undefined}
      onClick={onFetchCapabilities}
      style={buttonStyle}
      disabled={!url}
    >
      {fetching ?
        `Loading Capabilities (${wfsServiceLayersCount})`
      : `Fetch Capabilities`}
    </Button>
  )
}
