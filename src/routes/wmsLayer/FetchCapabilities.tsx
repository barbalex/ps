import { useCallback, memo, useState } from 'react'
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker'
import { Button, Spinner } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { Wms_layers as WmsLayer } from '../../../generated/client/index.ts'
import { useElectric } from '../../ElectricProvider.tsx'
import { createNotification } from '../../modules/createRows.ts'

import '../../form.css'
const createWorker = createWorkerFactory(
  () => import('./getCapabilitiesData.ts'),
)

const buttonStyle = {
  marginRight: -10,
}

type Props = {
  wmsLayer: WmsLayer
  disabled: boolean
}

export const FetchCapabilities = memo(({ wmsLayer, disabled }: Props) => {
  const { wms_layer_id } = useParams()
  const { db } = useElectric()!
  const worker = useWorker(createWorker)

  const [fetching, setFetching] = useState(false)

  const { results: layerOptions = [] } = useLiveQuery(
    db.layer_options.liveMany({
      where: {
        ...(wms_layer_id ? { wms_layer_id } : {}),
        field: 'wms_layer',
      },
      select: { layer_option_id: true },
    }),
  )

  const onFetchCapabilities = useCallback(async () => {
    console.log('FetchCapabilities,onFetchCapabilities, row:', wmsLayer)
    if (!wmsLayer?.wms_url) return
    // show loading indicator
    setFetching(true)
    const data = await createNotification({
      title: `Loading capabilities for ${wmsLayer.wms_url}`,
      intent: 'info',
      paused: true,
    })
    await db.notifications.create({ data })
    // 1. check if layer_options exist for this wms_url
    // const existingLayerOptions = await db.layer_options.findMany({
    //   where: { service_url: row.wms_url, field: 'wms_layer' },
    // })

    // 2. if not, fetch capabilities
    try {
      await worker.getCapabilitiesData({
        wmsLayer: wmsLayer,
        db,
        wmsServiceId: wmsLayer.wms_service_id,
      })
    } catch (error) {
      console.error(
        'hello WmsBaseUrl, onBlur, error getting capabilities data:',
        error?.message ?? error,
      )
      // surface error to user
      const data = await createNotification({
        title: `Error loading capabilities for ${wmsLayer.wms_url}`,
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
  }, [db, wmsLayer, worker])

  return (
    <Button
      icon={fetching ? <Spinner size="tiny" /> : undefined}
      title="Refresh capabilities data"
      onClick={onFetchCapabilities}
      style={buttonStyle}
      disabled={disabled}
    >
      {fetching
        ? `Loading capabilities for ${wmsLayer.wms_url} (${layerOptions.length})`
        : `Fetch Capabilities`}
    </Button>
  )
})
