import { useState } from 'react'
import {
  Combobox as ComboboxComponent,
  Option,
  Field,
} from '@fluentui/react-components'

export const Combobox = ({
  name,
  label,
  options,
  value,
  onChange,
  autoFocus,
  ref,
}) => {
  const [filter, setFilter] = useState(value ?? '')

  const onInput = (event) => {
    const filter = event.target.value
    setFilter(filter)
  }

  const onOptionSelect = (e, data) => {
    if (data.optionValue === 0) return setFilter('') // No options found
    onChange({ target: { name, value: data.optionValue } })
  }

  // console.log('Combobox', { name, label, options, value, filter })

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
          <Option
            key={value}
            text={value}
            value={value}
          />
        ))}
      </ComboboxComponent>
    </Field>
  )
}
