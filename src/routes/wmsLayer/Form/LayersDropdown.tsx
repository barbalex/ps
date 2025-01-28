import { memo, useMemo, useCallback } from 'react'
import { Dropdown, Field, Option } from '@fluentui/react-components'
import { useLiveQuery } from '@electric-sql/pglite-react'
import axios from 'redaxios'
import { usePGlite } from '@electric-sql/pglite-react'


export const LayersDropdown = memo(({ wmsLayer, validationMessage }) => {
  const db = usePGlite()
  const { results: wmsServiceLayers = [] } = useLiveQuery(
    db.wms_service_layers.liveMany({
      where: { wms_service_id: wmsLayer.wms_service_id },
      orderBy: { label: 'asc' },
    }),
  )

  const options = useMemo(
    () => wmsServiceLayers.map(({ name, label }) => ({ value: name, label })),
    [wmsServiceLayers],
  )
  const selectedOptions = useMemo(
    () =>
      options.filter(
        (option) => option.value === wmsLayer.wms_service_layer_name,
      ),
    [options, wmsLayer.wms_service_layer_name],
  )

  const onOptionSelect = useCallback(
    async (e, data) => {
      try {
        db.wms_layers.update({
          where: { wms_layer_id: wmsLayer.wms_layer_id },
          data: {
            wms_service_layer_name: data.optionValue ?? null,
            label: data.optionText ?? null,
          },
        })
      } catch (error) {
        console.log(
          'LayersDropdown.onOptionSelect, error updating wms layer:',
          error,
        )
      }
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
      let res
      try {
        res = await axios.get(wmsServiceLayer.legend_url, {
          responseType: 'blob',
        })
      } catch (error) {
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
          await db.wms_service_layers.update({
            where: {
              wms_service_layer_id: wmsServiceLayer.wms_service_layer_id,
            },
            data: { legend_image: byteArray },
          })
        } catch (error) {
          console.log('LayersDropdown.onOptionSelect, error:', error)
        }
      }
    },
    [
      db.wms_layers,
      db.wms_service_layers,
      wmsLayer.wms_layer_id,
      wmsServiceLayers,
    ],
  )

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
})
