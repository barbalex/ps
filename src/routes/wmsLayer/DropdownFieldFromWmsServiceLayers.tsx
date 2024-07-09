import { memo, useMemo, useCallback, forwardRef } from 'react'
import { Dropdown, Field, Option } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import axios from 'redaxios'

import { useElectric } from '../../ElectricProvider.tsx'

export const DropdownFieldFromWmsServiceLayers = memo(
  forwardRef(
    (
      {
        name,
        label,
        wms_service_id,
        wms_service_layer_name,
        onChange,
        autoFocus,
        validationMessage,
        validationState = 'none',
        row,
      },
      ref,
    ) => {
      const { db } = useElectric()!
      const { results: wmsServiceLayers = [] } = useLiveQuery(
        db.wms_service_layers.liveMany({
          where: { wms_service_id },
          orderBy: { label: 'asc' },
        }),
      )
      const options = useMemo(
        () =>
          wmsServiceLayers.map(({ name, label }) => ({ value: name, label })),
        [wmsServiceLayers],
      )
      const selectedOptions = useMemo(
        () => options.filter((option) => option.value === wms_service_layer_name),
        [options, wms_service_layer_name],
      )

      const onOptionSelect = useCallback(
        async (e, data) => {
          onChange({
            target: {
              name,
              value: { label: data.optionText, value: data.optionValue },
            },
          })

          // set the label too
          if (row) {
            onChange({
              target: {
                name: 'label',
                value: data.optionText,
              },
            })
          }

          // get the legend image
          let res
          try {
            res = await axios.get(
              `${row.wms_services.url}?language=eng&version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=${row.wms_layer?.value}&format=image/png&STYLE=default&&TRANSPARENT=true`,
              { responseType: 'blob' },
            )
          } catch (error) {
            // error can also be caused by timeout
            console.error(
              `hello error fetching legend for layer '${data.optionText}':`,
              error,
            )
            return false
          }
          console.log(
            'hello DropdownFieldFromLayerOptions, onOptionSelect, blob data:',
            res.data,
          )
          // 3. store it in wms_layers.wms_legend
          if (res.data) {
            onChange({
              target: {
                name: 'wms_legend',
                value: res.data,
              },
            })
          }
        },
        [name, onChange, row],
      )

      const labelWithCount = label
        ? options?.length
          ? `${label} (${options.length})`
          : label
        : '(no label provided)'

      return (
        <Field
          label={labelWithCount}
          validationMessage={validationMessage}
          validationState={validationState}
        >
          <Dropdown
            name={name}
            value={selectedOptions?.[0]?.label ?? ''}
            selectedOptions={selectedOptions}
            onOptionSelect={onOptionSelect}
            appearance="underline"
            clearable
            autoFocus={autoFocus}
            ref={ref}
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
  ),
)
