import { memo, useMemo, useCallback, forwardRef } from 'react'
import { Dropdown, Field, Option } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import axios from 'redaxios'

import { useElectric } from '../../ElectricProvider.tsx'

export const DropdownFieldFromLayerOptions = memo(
  forwardRef(
    (
      {
        name,
        label,
        wms_layer_id,
        vector_layer_id,
        value,
        onChange,
        autoFocus,
        validationMessage,
        validationState = 'none',
        row,
      },
      ref,
    ) => {
      const { db } = useElectric()!
      const { results: layerOptions = [] } = useLiveQuery(
        db.layer_options.liveMany({
          where: {
            ...(wms_layer_id ? { wms_layer_id } : {}),
            ...(vector_layer_id ? { vector_layer_id } : {}),
            field: name,
          },
          orderBy: { label: 'asc' },
        }),
      )
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
        },
        [name, onChange],
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
