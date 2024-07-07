import { useCallback, memo, useState } from 'react'
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker'
import { Button, Spinner } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { Vector_layers as VectorLayer } from '../../../../generated/client/index.ts'
import { useElectric } from '../../../ElectricProvider.tsx'
import { createNotification } from '../../../modules/createRows.ts'

const createWorker = createWorkerFactory(
  () => import('./getCapabilitiesData.ts'),
)

const buttonStyle = {
  minHeight: 32,
}

type Props = {
  row: VectorLayer
}

export const FetchCapabilities = memo(({ row }: Props) => {
  const { vector_layer_id } = useParams()
  const { db } = useElectric()!
  const worker = useWorker(createWorker)

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
    if (!row?.wfs_url) return
    // show loading indicator
    setFetching(true)
    const data = createNotification({
      title: `Loading capabilities for ${row.wfs_url}`,
      intent: 'info',
      paused: true,
    })
    await db.notifications.create({ data })
    try {
      // await getCapabilitiesData({ row, db })
      await worker.getCapabilitiesData({ row, db })
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
  }, [db, row, worker])

  return (
    <Button
      icon={fetching ? <Spinner size="tiny" /> : undefined}
      title="Refresh capabilities data"
      onClick={onFetchCapabilities}
      style={buttonStyle}
    >
      {fetching
        ? `Loading capabilities for ${row.wfs_url} (${layerOptions.length})`
        : `Fetch Capabilities`}
    </Button>
  )
})
