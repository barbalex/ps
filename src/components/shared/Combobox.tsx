import { memo, useState, useCallback } from 'react'
import {
  Combobox as ComboboxComponent,
  Option,
  Field,
} from '@fluentui/react-components'

export const Combobox = memo(
  ({ name, label, options, value, onChange, autoFocus, ref }) => {
    const [filter, setFilter] = useState(value ?? '')

    const onInput = useCallback(
      (event) => {
        const filter = event.target.value
        setFilter(filter)
      },
      [setFilter],
    )
    const onOptionSelect = useCallback(
      (e, data) => {
        if (data.optionValue === 0) return setFilter('') // No options found
        onChange({ target: { name, value: data.optionValue } })
      },
      [name, onChange],
    )

    console.log('Combobox', { name, label, options, value, filter })

    return (
      <Field label={label ?? '(no label provided)'}>
        <ComboboxComponent
          name={name}
          value={filter}
          selectedOptions={value ? [value] : []}
          onOptionSelect={onOptionSelect}
          onInput={onInput}
          appearance="underline"
          autoFocus={autoFocus}
          ref={ref}
          freeform
        >
          {options.map((value) => (
            <Option key={value} text={value} value={value} />
          ))}
        </ComboboxComponent>
      </Field>
    )
  },
)
