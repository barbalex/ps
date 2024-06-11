import { useCallback, memo, forwardRef } from 'react'
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker'

import { Tile_layers as TileLayer } from '../../../generated/client/index.ts'
import { useElectric } from '../../ElectricProvider.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { createNotification } from '../../modules/createRows.ts'

import '../../form.css'
const createWorker = createWorkerFactory(
  () => import('./getCapabilitiesData.ts'),
)

type Props = {
  onChange: () => void
  row: TileLayer
  autoFocus: boolean
}

export const BaseUrl = memo(
  forwardRef(({ onChange, row, autoFocus }, ref) => {
    const { db } = useElectric()!
    const worker = useWorker(createWorker)

    const onBlur = useCallback(async () => {
      if (!row?.wms_base_url) return
      // show loading indicator
      const data = await createNotification({
        title: `Loading capabilities data for ${row.wms_base_url}`,
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
    }, [db, row, worker])

    return (
      <TextField
        label="Base URL"
        name="wms_base_url"
        value={row.wms_base_url ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        autoFocus={autoFocus}
        ref={ref}
      />
    )
  }),
)
