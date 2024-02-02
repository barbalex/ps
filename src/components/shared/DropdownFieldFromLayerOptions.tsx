import { memo, useMemo } from 'react'
import { Dropdown, Field, Option } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

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
  }) => {
    // only one option can be selected, otherwise MultiSelectFromLayerOptions should be used
    const activeOption = value?.[0]
    const { db } = useElectric()
    const { results = [] } = useLiveQuery(
      db.layer_options.liveMany({
        where: {
          ...(tile_layer_id ? { tile_layer_id } : {}),
          ...(vector_layer_id ? { vector_layer_id } : {}),
          field: name,
        },
        select: { value: true, label: true },
        orderBy: { label: 'asc' },
      }),
    )
    const layerOptions: LayerOption[] = results
    const options = useMemo(
      () => layerOptions.map(({ value, label }) => ({ value, label })),
      [layerOptions],
    )
    const selectedOptions = useMemo(
      () => options.filter((option) => option.value === activeOption.value),
      [activeOption.value, options],
    )
    const labelWithCount = label
      ? options?.length
        ? `${label} (${options.length})`
        : label
      : '(no label provided)'

    console.log('hello DropdownFieldFromLayerOptions', {
      name,
      label,
      tile_layer_id,
      vector_layer_id,
      value,
      onChange,
      validationMessage,
      validationState,
      activeOption,
      db,
      results,
      layerOptions,
      options,
      selectedOptions,
      labelWithCount,
    })

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
          onOptionSelect={(e, data) => {
            console.log(
              'hello DropdownFieldFromLayerOptions, onOptionSelect:',
              { name, data, optionValue: data.optionValue },
            )
            onChange({
              target: {
                name,
                value: [{ label: data.optionText, value: data.optionValue }],
              },
            })
          }}
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
