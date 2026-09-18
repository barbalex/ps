import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Combobox: ComboboxComponent, Option, Field } = fluentUiReactComponents

type Props = {
  name?: string
  label?: string
  options: string[]
  value?: string
  onChange: (e: { target: { name?: string; value?: string | number } }) => void
  autoFocus?: boolean
  ref?: React.Ref<HTMLInputElement>
}

export const Combobox = ({
  name,
  label,
  options,
  value,
  onChange,
  autoFocus,
  ref,
}: Props) => {
  const [filter, setFilter] = useState(value ?? '')

  const onInput = (event: React.FormEvent<HTMLInputElement>) => {
    const filter = (event.target as HTMLInputElement).value
    setFilter(filter)
  }

  const onOptionSelect = (
    _e: unknown,
    data: { optionValue?: string | number },
  ) => {
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
          <Option key={value} text={value} value={value} />
        ))}
      </ComboboxComponent>
    </Field>
  )
}
