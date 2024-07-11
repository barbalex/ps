import { memo, useMemo, useCallback } from 'react'
import { Dropdown, Field, Option } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import axios from 'redaxios'

import { useElectric } from '../../../ElectricProvider.tsx'

export const DropdownFieldFromWmsServiceLayers = memo(
  ({ wmsLayer, validationMessage }) => {
    const { db } = useElectric()!
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
        db.wms_layers.update({
          where: { wms_layer_id: wmsLayer.wms_layer_id },
          data: {
            wms_service_layer_name: data.optionValue,
            label: data.optionText,
          },
        })

        // get the legend image
        let res
        const legendUrl = `${wmsLayer.wms_services.url}?language=eng&version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=${data.optionValue}&format=image/png&STYLE=default&&TRANSPARENT=true`
        try {
          res = await axios.get(legendUrl, { responseType: 'blob' })
        } catch (error) {
          // error can also be caused by timeout
          console.error(
            `hello error fetching legend for layer '${data.optionText}':`,
            error,
          )
          return false
        }
        // 3. store wms_service_layers.legend_image and legend_url
        if (res.data) {
          const wmsServiceLayer = wmsServiceLayers.find(
            (l) => l.name === data.optionValue,
          )
          if (!wmsServiceLayer) {
            return console.error(
              `hello DropdownFieldFromLayerOptions, onOptionSelect, wmsServiceLayer not found for layer '${data.optionText}'`,
            )
          }
          db.wms_service_layers.update({
            where: {
              wms_service_layer_id: wmsServiceLayer.wms_service_layer_id,
            },
            data: { legend_image: res.data, legend_url: legendUrl },
          })
        }
      },
      [
        db.wms_layers,
        db.wms_service_layers,
        wmsLayer.wms_layer_id,
        wmsLayer.wms_services.url,
        wmsServiceLayers,
      ],
    )

    const labelWithCount = options?.length
      ? `Layer (${options.length})`
      : 'Layer'

    return (
      <Field
        label={labelWithCount}
        validationMessage={validationMessage}
        validationState="none"
      >
        <Dropdown
          name="wms_service_layer_name"
          value={selectedOptions?.[0]?.label ?? ''}
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
  },
)
