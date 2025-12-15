import { createWorkerFactory, useWorker } from '@shopify/react-web-worker'
import { Button, Spinner } from '@fluentui/react-components'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import {
  createNotification,
  createWmsService,
} from '../../../../modules/createRows.ts'
import { addOperationAtom } from '../../../../store.ts'

const createWorker = createWorkerFactory(
  () => import('./getWmsCapabilitiesData.ts'),
)

const buttonStyle = {
  marginRight: -10,
}

export const FetchWmsCapabilities = ({
  wmsLayer,
  url,
  fetching,
  setFetching,
}) => {
  const db = usePGlite()
  const worker = useWorker(createWorker)
  const addOperation = useSetAtom(addOperationAtom)

  const res = useLiveQuery(
    `SELECT count(*) FROM wms_service_layers WHERE wms_service_id = $1`,
    [wmsLayer.wms_service_id],
  )
  const wmsServiceLayersCount = res?.rows?.[0]?.count

  const onFetchCapabilities = async () => {
    const urlTrimmed = url?.trim?.()
    if (!urlTrimmed) return

    // 1. check if wms_service exists for this url
    const resES = await db.query(`SELECT * FROM wms_services WHERE url = $1`, [
      urlTrimmed,
    ])
    const existingService = resES.rows?.[0]

    let service
    if (existingService) {
      // 2. if so, update it
      service = { ...existingService }
      // and remove its layers to be recreated
      await db.query(
        `DELETE FROM wms_service_layers WHERE wms_service_id = $1`,
        [service.wms_service_id],
      )
      addOperation({
        table: 'wms_service_layers',
        filter: {
          function: 'eq',
          column: 'wms_service_id',
          value: service.wms_service_id,
        },
        operation: 'delete',
      })
      // ensure wmsLayer.wms_service_id is set
      await db.query(
        `UPDATE wms_layers SET wms_service_id = $1 WHERE wms_layer_id = $2`,
        [service.wms_service_id, wmsLayer.wms_layer_id],
      )
      addOperation({
        table: 'wms_layers',
        rowIdName: 'wms_layer_id',
        rowId: wmsLayer.wms_layer_id,
        operation: 'update',
        draft: { wms_service_id: service.wms_service_id },
      })
    } else {
      // 3. if not, create service, then update that
      const wms_service_id = await createWmsService({
        url: urlTrimmed,
        projectId: wmsLayer.project_id,
        db,
      })
      try {
        await db.query(
          `UPDATE wms_layers SET wms_service_id = $1 WHERE wms_layer_id = $2`,
          [wms_service_id, wmsLayer.wms_layer_id],
        )
      } catch (error) {
        console.error('FetchCapabilities.onFetchCapabilities 3', error)
      }
      addOperation({
        table: 'wms_layers',
        rowIdName: 'wms_layer_id',
        rowId: wmsLayer.wms_layer_id,
        operation: 'update',
        draft: { wms_service_id },
      })
    }

    // show loading indicator
    setFetching(true)
    const notificationId = await createNotification({
      title: `Loading capabilities for ${urlTrimmed}`,
      intent: 'info',
      paused: true,
      db,
    })

    // fetch capabilities
    try {
      await worker.getWmsCapabilitiesData({
        wmsLayer,
        service,
        db,
      })
    } catch (error) {
      console.error(
        'hello WmsBaseUrl, onBlur, error getting capabilities data:',
        error?.message ?? error,
      )
      // surface error to user
      await createNotification({
        title: `Error loading capabilities for ${urlTrimmed}`,
        body: error?.message ?? error,
        intent: 'error',
        paused: false,
        db,
      })
    }
    setFetching(false)
    await db.query(
      `UPDATE notifications SET paused = false AND timeout = 500 WHERE notification_id = $1`,
      [notificationId],
    )
    addOperation({
      table: 'notifications',
      rowIdName: 'notification_id',
      rowId: notificationId,
      operation: 'update',
      draft: { paused: false, timeout: 500 },
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
        `Loading Capabilities (${wmsServiceLayersCount})`
      : `Fetch Capabilities`}
    </Button>
  )
}
