import { memo, useMemo } from 'react'
import { Dropdown, Field, Option } from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'

export const DropdownField = memo((props: InputProps) => {
  const { name, label, options, value, onChange } = props
  const selectedOptions = useMemo(
    () => options.filter(({ value: v }) => v === value),
    [options, value],
  )

  return (
    <Field label={label ?? '(no label provided)'}>
      <Dropdown
        name={name}
        value={selectedOptions?.[0]?.text ?? ''}
        selectedOptions={selectedOptions}
        onOptionSelect={(e, data) =>
          onChange({ target: { name, value: data.optionValue } })
        }
        appearance="underline"
      >
        {options.map((params) => {
          const { text, value } = params
          console.log('DropdownField', { params, name, value, options })
          return (
            <Option key={value} value={value}>
              {text}
            </Option>
          )
        })}
      </Dropdown>
    </Field>
  )
})
