import { useCallback, memo } from 'react'
import { useParams } from 'react-router-dom'
import {
  useId,
  useToastController,
  ToastTitle,
  Toast,
} from '@fluentui/react-components'

import { Tile_layers as TileLayer } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { getCapabilitiesData } from './getCapabilitiesData'

import '../../form.css'

export const WmsBaseUrl = memo(
  ({ onChange, row }: { onChange: () => void; row: TileLayer }) => {
    const { tile_layer_id } = useParams()

    const { db } = useElectric()

    const toasterId = useId(`capabilitiesToaster/${tile_layer_id}`)
    const toastId = useId(`capabilitiesToast/${tile_layer_id}`)
    const { dispatchToast, dismissToast } = useToastController(toasterId)
    const onBlur = useCallback(async () => {
      if (!row?.wms_base_url) return
      console.log('hello WmsBaseUrl, onBlur, getting capabilities')
      // show loading indicator
      dispatchToast(
        <Toast>
          <ToastTitle>{`Loading capabilities data for ${row.wms_base_url}`}</ToastTitle>
        </Toast>,
        {
          toastId,
          intent: 'success',
          onStatusChange: (e, { status }) =>
            console.log('hello, status of toast:', status),
        },
      )
      try {
        await getCapabilitiesData({ row, db })
      } catch (error) {
        console.error(
          'hello WmsBaseUrl, onBlur, error getting capabilities data:',
          error?.message ?? error,
        )
        // TODO: surface error to user
      }
      dismissToast(toastId)
      console.log('hello WmsBaseUrl, onBlur, finished getting capabilities')
    }, [db, dismissToast, dispatchToast, row, toastId])

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
