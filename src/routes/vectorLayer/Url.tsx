import { useCallback, memo } from 'react'
import { uuidv7 } from '@kripod/uuidv7'
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker'

import { Vector_layers as VectorLayer } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'

const createWorker = createWorkerFactory(() => import('./getCapabilitiesData'))

export const Url = memo(
  ({ onChange, row }: { onChange: () => void; row: VectorLayer }) => {
    const { db } = useElectric()
    const worker = useWorker(createWorker)

    const onBlur = useCallback(async () => {
      if (!row?.wfs_url) return
      // TODO: compare with old value and only update if changed
      // show loading indicator
      const notification_id = uuidv7()
      await db.notifications.create({
        data: {
          notification_id,
          title: `Loading capabilities data for ${row.wfs_url}`,
          intent: 'info',
          paused: true,
        },
      })
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
        where: { notification_id },
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
            : 'Enter the url of the service providing the wfs. The capabilities will then be loaded and the layers available for selection.'
        }
      />
    )
  },
)
