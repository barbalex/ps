import { useCallback, memo, forwardRef, useState } from 'react'
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker'
import { Button, Spinner } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { Tile_layers as TileLayer } from '../../../generated/client/index.ts'
import { useElectric } from '../../ElectricProvider.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { createNotification } from '../../modules/createRows.ts'

import '../../form.css'
const createWorker = createWorkerFactory(
  () => import('./getCapabilitiesData.ts'),
)

const buttonStyle = {
  minHeight: 32,
}

type Props = {
  onChange: () => void
  row: TileLayer
  autoFocus: boolean
}

export const BaseUrl = memo(
  forwardRef(({ onChange, row, autoFocus }: Props, ref) => {
    const { tile_layer_id } = useParams()
    const { db } = useElectric()!
    const worker = useWorker(createWorker)

    const [fetching, setFetching] = useState(false)

    const { results: layerOptions = [] } = useLiveQuery(
      db.layer_options.liveMany({
        where: {
          ...(tile_layer_id ? { tile_layer_id } : {}),
          field: 'wms_layer',
        },
        select: { layer_option_id: true },
      }),
    )

    const onFetchCapabilities = useCallback(async () => {
      if (!row?.wms_base_url) return
      // show loading indicator
      setFetching(true)
      const data = await createNotification({
        title: `Loading capabilities for ${row.wms_base_url}`,
        intent: 'info',
        paused: true,
      })
      await db.notifications.create({ data })
      try {
        await worker.getCapabilitiesData({ row, db })
      } catch (error) {
        console.error(
          'hello WmsBaseUrl, onBlur, error getting capabilities data:',
          error?.message ?? error,
        )
        // surface error to user
        const data = await createNotification({
          title: `Error loading capabilities for ${row.wms_base_url}`,
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
    }, [db, row, worker])

    return (
      <>
        <TextField
          label="Base URL"
          name="wms_base_url"
          value={row.wms_base_url ?? ''}
          onChange={onChange}
          autoFocus={autoFocus}
          ref={ref}
          validationMessage={
            row?.wms_url ? (
              'The url of the service providing the WMS'
            ) : (
              <>
                <p>Enter the url of the service providing the WMS.</p>
                <p>Then capabilities can be loaded and a layer selected.</p>
              </>
            )
          }
        />
        {!!row?.wms_base_url && (
          <Button
            icon={fetching ? <Spinner size="tiny" /> : undefined}
            title="Refresh capabilities data"
            onClick={onFetchCapabilities}
            style={buttonStyle}
          >
            {fetching
              ? `Loading capabilities for ${row.wms_base_url} (${layerOptions.length})`
              : `Fetch Capabilities`}
          </Button>
        )}
      </>
    )
  }),
)
