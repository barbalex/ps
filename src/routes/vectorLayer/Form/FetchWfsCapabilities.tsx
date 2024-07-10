import { useCallback, memo, useState } from 'react'
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker'
import { Button, Spinner } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

import {
  Vector_layers as VectorLayer,
  Wfs_services as WfsService,
} from '../../../../generated/client/index.ts'
import { useElectric } from '../../../ElectricProvider.tsx'
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

type Props = {
  vectorLayer: VectorLayer
  url: string
}

export const FetchWfsCapabilities = memo(({ vectorLayer, url }: Props) => {
  const { db } = useElectric()!
  const worker = useWorker(createWorker)

  const [fetching, setFetching] = useState(false)

  const { results: wfsServiceLayers = [] } = useLiveQuery(
    db.wfs_service_layers.liveMany({
      where: { wfs_service_id: vectorLayer.wfs_service_id },
      select: { wfs_service_layer_id: true },
    }),
  )

  const onFetchCapabilities = useCallback(async () => {
    // console.log(
    //   'FetchWfsCapabilities.onFetchCapabilities, wfsService:',
    //   wfsService,
    // )
    // if (!wfsService?.url) return
    // // show loading indicator
    // setFetching(true)
    // const data = createNotification({
    //   title: `Loading capabilities for ${wfsService.url}`,
    //   intent: 'info',
    //   paused: true,
    // })
    // await db.notifications.create({ data })
    // try {
    //   await worker.getWfsCapabilitiesData({ vectorLayer, db })
    // } catch (error) {
    //   console.error(
    //     'Url, onBlur, error getting capabilities data:',
    //     error?.message ?? error,
    //   )
    //   // TODO: surface error to user
    // }
    // try {
    //   await db.notifications.update({
    //     where: { notification_id: data.notification_id },
    //     data: { paused: false, timeout: 500 },
    //   })
    // } catch (error) {
    //   console.log('Url, onBlur, error updating notification:', error)
    // }
    // setFetching(false)
  }, [])

  return (
    <Button
      icon={fetching ? <Spinner size="tiny" /> : undefined}
      onClick={onFetchCapabilities}
      style={buttonStyle}
      disabled={!url}
    >
      {fetching
        ? `Loading Capabilities (${wfsServiceLayers.length})`
        : `Fetch Capabilities`}
    </Button>
  )
})
