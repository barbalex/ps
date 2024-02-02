import { useCallback, memo } from 'react'
import { uuidv7 } from '@kripod/uuidv7'

import { Vector_layers as VectorLayer } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { getCapabilitiesData } from './getCapabilitiesData'

export const Url = memo(
  ({ onChange, row }: { onChange: () => void; row: VectorLayer }) => {
    const { db } = useElectric()

    const onBlur = useCallback(async () => {
      if (!row?.url) return
      console.log('hello Url, onBlur, getting capabilities')
      // show loading indicator
      const notification_id = uuidv7()
      await db.notifications.create({
        data: {
          notification_id,
          title: `Loading capabilities data for ${row.url}`,
          intent: 'info',
          paused: true,
        },
      })
      try {
        await getCapabilitiesData({ row, db })
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
      console.log('hello Url, onBlur, finished getting capabilities')
    }, [db, row])

    return (
      <TextField
        label="Url"
        name="url"
        value={row.url ?? ''}
        onChange={onChange}
        onBlur={onBlur}
      />
    )
  },
)
