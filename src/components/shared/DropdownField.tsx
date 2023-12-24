import { memo } from 'react'
import { Dropdown, Field, Option } from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'

export const DropdownField = memo((props: InputProps) => {
  const { name, label, options, value, onChange } = props

  return (
    <Field label={label ?? '(no label provided)'}>
      <Dropdown
        // {...props}
        name={name}
        value={value}
        selectedOptions={options.filter(({ value: v }) => v === value)}
        onOptionSelect={(e, data) =>
          onChange({ target: { name, value: data.optionValue } })
        }
        appearance="underline"
      >
        {options.map(({ text, value }) => (
          <Option key={value} value={value}>
            {text}
          </Option>
        ))}
      </Dropdown>
    </Field>
  )
})
