import { useCallback, memo } from 'react'
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker'

import { Vector_layers as VectorLayer } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider.tsx'
import { TextField } from '../../components/shared/TextField'
import { createNotification } from '../../modules/createRows'

const createWorker = createWorkerFactory(() => import('./getCapabilitiesData'))

export const Url = memo(
  ({ onChange, row }: { onChange: () => void; row: VectorLayer }) => {
    const { db } = useElectric()!
    const worker = useWorker(createWorker)

    const onBlur = useCallback(async () => {
      if (!row?.wfs_url) return
      // TODO: compare with old value and only update if changed
      // show loading indicator
      const data = createNotification({
        title: `Loading capabilities data for ${row.wfs_url}`,
        intent: 'info',
        paused: true,
      })
      await db.notifications.create({ data })
      try {
        // await getCapabilitiesData({ row, db })
        await worker.getCapabilitiesData({ row, db })
      } catch (error) {
        console.error(
          'hello Url, onBlur, error getting capabilities data:',
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
        label="Url"
        name="wfs_url"
        value={row.wfs_url ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        validationMessage={
          row?.wfs_url
            ? 'The url of the service providing the wfs'
            : 'Enter the url of the service providing the wfs. The capabilities will then be loaded and the layers available for selection'
        }
      />
    )
  },
)
