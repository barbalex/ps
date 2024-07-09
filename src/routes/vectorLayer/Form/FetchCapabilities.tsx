import { useCallback, memo, useState } from 'react'
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker'
import { Button, Spinner } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import {
  Vector_layers as VectorLayer,
  Wfs_services as WfsService,
} from '../../../../generated/client/index.ts'
import { useElectric } from '../../../ElectricProvider.tsx'
import { createNotification } from '../../../modules/createRows.ts'

const createWorker = createWorkerFactory(
  () => import('./getCapabilitiesData.ts'),
)

const buttonStyle = {
  minHeight: 32,
}

type Props = {
  vectorLayer: VectorLayer
}

export const FetchCapabilities = memo(({ vectorLayer }: Props) => {
  const { vector_layer_id } = useParams()
  const { db } = useElectric()!
  const worker = useWorker(createWorker)

  const wfsService: WfsService | undefined = vectorLayer?.wms_services

  const { results: layerOptions = [] } = useLiveQuery(
    db.layer_options.liveMany({
      where: {
        ...(vector_layer_id ? { vector_layer_id } : {}),
        field: 'wfs_layer',
      },
      select: { layer_option_id: true },
    }),
  )

  const [fetching, setFetching] = useState(false)

  const onFetchCapabilities = useCallback(async () => {
    if (!wfsService?.url) return
    // show loading indicator
    setFetching(true)
    const data = createNotification({
      title: `Loading capabilities for ${wfsService.url}`,
      intent: 'info',
      paused: true,
    })
    await db.notifications.create({ data })
    try {
      await worker.getCapabilitiesData({ vectorLayer, db })
    } catch (error) {
      console.error(
        'Url, onBlur, error getting capabilities data:',
        error?.message ?? error,
      )
      // TODO: surface error to user
    }
    try {
      await db.notifications.update({
        where: { notification_id: data.notification_id },
        data: { paused: false, timeout: 500 },
      })
    } catch (error) {
      console.log('Url, onBlur, error updating notification:', error)
    }
    setFetching(false)
  }, [db, vectorLayer, wfsService.url, worker])

  return (
    <Button
      icon={fetching ? <Spinner size="tiny" /> : undefined}
      title="Refresh capabilities data"
      onClick={onFetchCapabilities}
      style={buttonStyle}
    >
      {fetching
        ? `Loading capabilities for ${wfsService.url} (${wfsService.wfs_service_layers.length})`
        : `Fetch Capabilities`}
    </Button>
  )
})
