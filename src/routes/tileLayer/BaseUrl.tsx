import { useCallback, memo, forwardRef, useState } from 'react'
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker'
import { Button, Spinner } from '@fluentui/react-components'

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
    const { db } = useElectric()!
    const worker = useWorker(createWorker)

    const [fetching, setFetching] = useState(false)

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
        // TODO: surface error to user
      }
      await db.notifications.update({
        where: { notification_id: data.notification_id },
        data: { paused: false, timeout: 500 },
      })
      setFetching(false)
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
        />
        <Button
          icon={fetching ? <Spinner size="tiny" /> : undefined}
          title="Refresh capabilities data"
          onClick={onFetchCapabilities}
          style={buttonStyle}
        >
          {fetching
            ? `Loading capabilities for ${row.wms_base_url}`
            : `Fetch Capabilities (click to choose a layer)`}
        </Button>
      </>
    )
  }),
)
