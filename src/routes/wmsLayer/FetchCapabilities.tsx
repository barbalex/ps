import { useCallback, memo, useState } from 'react'
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker'
import { Button, Spinner } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { Wms_layers as WmsLayer } from '../../../generated/client/index.ts'
import { useElectric } from '../../ElectricProvider.tsx'
import {
  createNotification,
  createWmsService,
} from '../../modules/createRows.ts'

import '../../form.css'
const createWorker = createWorkerFactory(
  () => import('./getWmsCapabilitiesData.ts'),
)

const buttonStyle = {
  marginRight: -10,
}

type Props = {
  wmsLayer: WmsLayer
  url: string
}

export const FetchCapabilities = memo(({ wmsLayer, url }: Props) => {
  const { wms_layer_id, project_id } = useParams()
  const { db } = useElectric()!
  const worker = useWorker(createWorker)

  const [fetching, setFetching] = useState(false)

  const { results: wmsServiceLayers = [] } = useLiveQuery(
    db.wms_service_layers.liveMany({
      where: { wms_service_id: wmsLayer.wms_service_id },
      select: { wms_service_layer_id: true },
    }),
  )

  const onFetchCapabilities = useCallback(async () => {
    console.log('FetchCapabilities.onFetchCapabilities 1', { wmsLayer, url })
    if (!url) return

    const service = createWmsService({ url, project_id })
    console.log('FetchCapabilities.onFetchCapabilities 2', { service })
    let resp
    try {
      resp = await db.wms_services.create({ data: service })
    } catch (error) {
      console.error('FetchCapabilities.onFetchCapabilities 3', error)
    }
    console.log('FetchCapabilities.onFetchCapabilities 3', { resp })
    await db.wms_layers.update({
      where: { wms_layer_id },
      data: { wms_service_id: service.wms_service_id },
    })
    // show loading indicator
    setFetching(true)
    const data = await createNotification({
      title: `Loading capabilities for ${url}`,
      intent: 'info',
      paused: true,
    })
    await db.notifications.create({ data })
    // TODO: 1. check if wms_service_layers exist for this service

    // 2. if not, fetch capabilities
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
      const data = await createNotification({
        title: `Error loading capabilities for ${url}`,
        body: error?.message ?? error,
        intent: 'error',
        paused: false,
      })
      await db.notifications.create({ data })
    }
    setFetching(false)
    await db.notifications.update({
      where: { notification_id: data.notification_id },
      data: { paused: false, timeout: 500 },
    })
  }, [db, project_id, url, wmsLayer, wms_layer_id, worker])

  return (
    <Button
      icon={fetching ? <Spinner size="tiny" /> : undefined}
      title="Refresh capabilities data"
      onClick={onFetchCapabilities}
      style={buttonStyle}
      disabled={!url}
    >
      {fetching
        ? `Loading Capabilities (${wmsServiceLayers.length})`
        : `Fetch Capabilities`}
    </Button>
  )
})
