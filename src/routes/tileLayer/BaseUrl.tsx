import { useCallback, memo } from 'react'
import { uuidv7 } from '@kripod/uuidv7'

import { Tile_layers as TileLayer } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { getCapabilitiesData } from './getCapabilitiesData'

import '../../form.css'

export const BaseUrl = memo(
  ({ onChange, row }: { onChange: () => void; row: TileLayer }) => {
    const { db } = useElectric()

    const onBlur = useCallback(async () => {
      if (!row?.wms_base_url) return
      console.log('hello WmsBaseUrl, onBlur, getting capabilities')
      // show loading indicator
      const notification_id = uuidv7()
      await db.notifications.create({
        data: {
          notification_id,
          title: `Loading capabilities data for ${row.wms_base_url}`,
          intent: 'info',
          paused: true,
        },
      })
      try {
        await getCapabilitiesData({ row, db })
      } catch (error) {
        console.error(
          'hello WmsBaseUrl, onBlur, error getting capabilities data:',
          error?.message ?? error,
        )
        // TODO: surface error to user
      }
      await db.notifications.update({
        where: { notification_id },
        data: { paused: false, timeout: 500 },
      })
      console.log('hello WmsBaseUrl, onBlur, finished getting capabilities')
    }, [db, row])

    return (
      <TextField
        label="Base URL"
        name="wms_base_url"
        value={row.wms_base_url ?? ''}
        onChange={onChange}
        onBlur={onBlur}
      />
    )
  },
)
