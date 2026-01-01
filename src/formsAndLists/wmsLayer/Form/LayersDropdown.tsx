import { Dropdown, Field, Option } from '@fluentui/react-components'
import axios from 'redaxios'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { setShortTermOnlineFromFetchError } from '../../../modules/setShortTermOnlineFromFetchError.ts'
import { addOperationAtom } from '../../../store.ts'

import type WmsServiceLayers from '../../../models/public/WmsServiceLayers.ts'
import type WmsLayers from '../../../models/public/WmsLayers.ts'

type Props = {
  wmsLayer: WmsLayers
  validationMessage?: string
}

type ResData = Pick<
  WmsServiceLayers,
  'wms_service_layer_id' | 'name' | 'label'
>[]

export const LayersDropdown = ({ wmsLayer, validationMessage }: Props) => {
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  const res = useLiveQuery(
    `
    SELECT 
      wms_service_layer_id, 
      name, 
      label 
    FROM 
      wms_service_layers 
    WHERE 
      wms_service_id = $1 
    ORDER BY 
      label`,
    [wmsLayer.wms_service_id],
  )
  const wmsServiceLayers: ResData = res?.rows ?? []

  const options = wmsServiceLayers.map(({ name, label }) => ({
    value: name,
    label,
  }))
  const selectedOptions = options.filter(
    (option) => option.value === wmsLayer.wms_service_layer_name,
  )

  const onOptionSelect = async (e, data) => {
    try {
      db.query(
        `UPDATE wms_layers SET wms_service_layer_name = $1, label = $2 WHERE wms_layer_id = $3`,
        [
          data.optionValue ?? null,
          data.optionText ?? null,
          wmsLayer.wms_layer_id,
        ],
      )
    } catch (error) {
      console.log(
        'LayersDropdown.onOptionSelect, error updating wms layer:',
        error,
      )
    }
    addOperation({
      table: 'wms_layers',
      rowIdName: 'wms_layer_id',
      rowId: wmsLayer.wms_layer_id,
      operation: 'update',
      draft: {
        wms_service_layer_name: data.optionValue,
        label: data.optionText,
      },
      prev: { ...wmsLayer },
    })
    // return if no value was chosen
    if (!data.optionValue) {
      return
    }

    const wmsServiceLayer = wmsServiceLayers.find(
      (l) => l.name === data.optionValue,
    )
    if (!wmsServiceLayer) {
      return console.error(
        `hello DropdownFieldFromLayerOptions, onOptionSelect, wmsServiceLayer not found for layer '${data.optionText}'`,
      )
    }

    // get the legend image
    if (!wmsServiceLayer.legend_url) {
      return console.warn(
        `DropdownFieldFromLayerOptions, onOptionSelect, no legend_url for layer '${data.optionText}', so not fetching the legend image`,
      )
    }
    let res
    try {
      res = await axios.get(wmsServiceLayer.legend_url, {
        responseType: 'blob',
      })
    } catch (error) {
      setShortTermOnlineFromFetchError(error)
      // error can also be caused by timeout
      console.error(
        `hello error fetching legend for layer '${data.optionText}':`,
        error,
      )
      return false
    }
    // it seems a byte array is needed to store the image in the database
    // create an array buffer
    const arrayBuffer = await new Response(res.data).arrayBuffer()
    // convert to byte array
    const byteArray = new Uint8Array(arrayBuffer)
    // TODO: show using base64: https://stackoverflow.com/a/20756091/712005
    // 3. store wms_service_layers.legend_image and legend_url
    if (res.data) {
      try {
        await db.query(
          `UPDATE wms_service_layers SET legend_image = $1 WHERE wms_service_layer_id = $2`,
          [byteArray, wmsServiceLayer.wms_service_layer_id],
        )
      } catch (error) {
        console.log('LayersDropdown.onOptionSelect, error:', error)
      }
      addOperation({
        table: 'wms_service_layers',
        rowIdName: 'wms_service_layer_id',
        rowId: wmsServiceLayer.wms_service_layer_id,
        operation: 'update',
        draft: {
          legend_image: byteArray,
        },
        prev: { ...wmsServiceLayer },
      })
    }
  }

  const labelWithCount = options?.length ? `Layer (${options.length})` : 'Layer'

  return (
    <Field
      label={labelWithCount}
      validationMessage={validationMessage}
      validationState="none"
    >
      <Dropdown
        name="wms_service_layer_name"
        value={selectedOptions?.[0]?.label ?? null}
        selectedOptions={selectedOptions}
        onOptionSelect={onOptionSelect}
        appearance="underline"
        clearable
      >
        {options.map((option) => {
          return (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          )
        })}
      </Dropdown>
    </Field>
  )
}
