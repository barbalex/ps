import { memo, useMemo, useCallback } from 'react'
import { Dropdown, Field, Option } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import axios from 'redaxios'

import { useElectric } from '../../ElectricProvider'
import { Layer_options as LayerOption } from '../../generated/client'

export const DropdownFieldFromLayerOptions = memo(
  ({
    name,
    label,
    tile_layer_id,
    vector_layer_id,
    value,
    onChange,
    validationMessage,
    validationState = 'none',
    row,
  }) => {
    const { db } = useElectric()!
    const { results = [] } = useLiveQuery(
      db.layer_options.liveMany({
        where: {
          ...(tile_layer_id ? { tile_layer_id } : {}),
          ...(vector_layer_id ? { vector_layer_id } : {}),
          field: name,
        },
        orderBy: { label: 'asc' },
      }),
    )
    const layerOptions: LayerOption[] = results
    const options = useMemo(
      () => layerOptions.map(({ value, label }) => ({ value, label })),
      [layerOptions],
    )
    const selectedOptions = useMemo(
      () => options.filter((option) => option.value === value.value),
      [value.value, options],
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
        // download the legend image
        // 1. get the legend_url from the layer_options
        const legendUrl = layerOptions.find(
          (option) => option.value === data.optionValue,
        )?.legend_url
        console.log('hello DropdownFieldFromLayerOptions, onOptionSelect', {
          legendUrl,
          layerOptions,
          data,
          option: layerOptions.find(
            (option) => option.value === data.optionValue,
          ),
        })
        if (!legendUrl) return
        // 2. download the legend image
        // TODO:
        // this fails because electric-sql does not support binary data yet
        // When support is added:
        // check if it works
        // show legend in vector_layer form, maybe map?
        let res
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
        console.log(
          'hello DropdownFieldFromLayerOptions, onOptionSelect, blob data:',
          res.data,
        )
        // 3. store it in tile_layers.wms_legend
        if (res.data) {
          onChange({
            target: {
              name: 'wms_legend',
              value: res.data,
            },
          })
        }
      },
      [layerOptions, name, onChange, row],
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
