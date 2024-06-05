import { memo, useMemo } from 'react'
import { Dropdown, Option } from '@fluentui/react-components'

export const DropdownField = memo(({ options, value, onChange }) => {
  const selectedOptions = useMemo(
    () => options.filter((option) => option.value === value),
    [options, value],
  )

  return (
    <Dropdown
      value={selectedOptions?.[0] ?? ''}
      selectedOptions={selectedOptions}
      onOptionSelect={(e, data) =>
        onChange({ value: data.optionValue, previousValue: value })
      }
      clearable
    >
      {options.map((option) => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Dropdown>
  )
})
