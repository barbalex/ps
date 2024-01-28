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
    field,
    value,
    onChange,
    validationMessage,
    validationState = 'none',
  }) => {
    const { db } = useElectric()
    const { results = [] } = useLiveQuery(
      db.layer_options.liveMany({
        where: {
          ...(tile_layer_id ? { tile_layer_id } : {}),
          ...(vector_layer_id ? { vector_layer_id } : {}),
          field,
        },
        select: { value: true, label: true },
        orderBy: { label: 'asc' },
      }),
    )
    console.log('hello DropdownFieldFromLayerOptions, results: ', results)
    const layerOptions: LayerOption[] = results ?? []
    const options = useMemo(
      () => layerOptions.map(({ value, label }) => ({ value, label })),
      [layerOptions],
    )
    const selectedOptions = useMemo(
      () => options.filter((option) => option.value === value),
      [options, value],
    )
    console.log('hello DropdownFieldFromLayerOptions, options: ', {
      options,
      value,
      selectedOptions,
    })

    return (
      <Field
        label={label ?? '(no label provided)'}
        validationMessage={validationMessage}
        validationState={validationState}
      >
        <Dropdown
          name={name}
          value={selectedOptions?.[0]?.value ?? ''}
          selectedOptions={selectedOptions}
          onOptionSelect={(e, data) =>
            onChange({ target: { name, value: data.optionValue } })
          }
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
