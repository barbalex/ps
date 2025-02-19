import { useCallback, memo } from 'react'
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker'
import { Button, Spinner } from '@fluentui/react-components'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { usePGlite } from '@electric-sql/pglite-react'

import {
  createNotification,
  createWfsService,
} from '../../../modules/createRows.ts'

const createWorker = createWorkerFactory(
  () => import('./getWfsCapabilitiesData.ts'),
)

const buttonStyle = {
  minHeight: 32,
}

export const FetchWfsCapabilities = memo(
  ({ vectorLayer, url, fetching, setFetching }) => {
    const db = usePGlite()
    const worker = useWorker(createWorker)

    const result = useLiveQuery(
      `SELECT count(*) FROM wfs_service_layers WHERE wfs_service_id = $1`,
      [vectorLayer.wfs_service_id],
    )
    const wfsServiceLayersCount = result?.rows?.[0]?.count ?? 0

    const onFetchCapabilities = useCallback(async () => {
      const urlTrimmed = url?.trim?.()
      if (!urlTrimmed) return

      // 1. check if wfs_service exists for this url
      const eSRes = await db.query(
        `SELECT * FROM wfs_services WHERE url = $1`,
        [urlTrimmed],
      )
      const existingService = eSRes.rows[0]
      let service
      if (existingService) {
        // 2. if so, update it
        service = { ...existingService }
        // and remove its layers to be recreated
        await db.query(
          `DELETE FROM wfs_service_layers WHERE wfs_service_id = $1`,
          [service.wfs_service_id],
        )
        // ensure vectorLayer.wfs_service_id is set
        await db.query(
          `UPDATE vector_layers SET wfs_service_id = $1 WHERE vector_layer_id = $2`,
          [service.wfs_service_id, vectorLayer.vector_layer_id],
        )
      } else {
        // 3. if not, create service, then update that
        const serviceData = createWfsService({
          url: urlTrimmed,
          project_id: vectorLayer.project_id,
        })
        try {
          service = await db.wfs_services.create({ data: serviceData })
          await db.vector_layers.update({
            where: { vector_layer_id: vectorLayer.vector_layer_id },
            data: { wfs_service_id: serviceData.wfs_service_id },
          })
        } catch (error) {
          console.error('FetchCapabilities.onFetchCapabilities 3', error)
        }
      }

      // show loading indicator
      setFetching(true)
      const res = await createNotification({
        title: `Loading capabilities for ${urlTrimmed}`,
        intent: 'info',
        paused: true,
        db,
      })
      const notifData = res.rows[0]

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
        [notifData.notification_id],
      )
    }, [db, setFetching, url, vectorLayer, worker])

    return (
      <Button
        icon={fetching ? <Spinner size="tiny" /> : undefined}
        onClick={onFetchCapabilities}
        style={buttonStyle}
        disabled={!url}
      >
        {fetching
          ? `Loading Capabilities (${wfsServiceLayersCount})`
          : `Fetch Capabilities`}
      </Button>
    )
  },
)
