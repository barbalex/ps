import { useCallback, memo, useState } from 'react'
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker'
import { Button, Spinner } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

import { Wms_layers as WmsLayer } from '../../../generated/client/index.ts'
import { useElectric } from '../../ElectricProvider.tsx'
import {
  createNotification,
  createWmsService,
} from '../../modules/createRows.ts'

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

export const FetchWmsCapabilities = memo(({ wmsLayer, url }: Props) => {
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
    const urlTrimmed = url?.trim?.()
    if (!urlTrimmed) return

    // TODO:
    // 1. check if wms_service exists for this url
    const existingService = await db.wms_services.findFirst({
      where: { url: urlTrimmed },
    })
    let service
    if (existingService) {
      // 2. if so, update it
      service = { ...existingService }
      // and remove its layers to be recreated
      // 4. TODO: remove all wms_service_layers before recreating
      await db.wms_service_layers.deleteMany({
        where: { wms_service_id: existingService.wms_service_id },
      })
    } else {
      // 3. if not, create service, then update that
      const serviceData = createWmsService({
        url: urlTrimmed,
        project_id: wmsLayer.project_id,
      })
      try {
        service = await db.wms_services.create({ data: serviceData })
        await db.wms_layers.update({
          where: { wms_layer_id: wmsLayer.wms_layer_id },
          data: { wms_service_id: service.wms_service_id },
        })
      } catch (error) {
        console.error('FetchCapabilities.onFetchCapabilities 3', error)
      }
    }

    // show loading indicator
    setFetching(true)
    const data = await createNotification({
      title: `Loading capabilities for ${urlTrimmed}`,
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
        title: `Error loading capabilities for ${urlTrimmed}`,
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
  }, [db, url, wmsLayer, worker])

  return (
    <Button
      icon={fetching ? <Spinner size="tiny" /> : undefined}
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
