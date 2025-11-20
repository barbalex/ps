import { Dropdown, Option } from '@fluentui/react-components'

export const DropdownField = ({ options, value, onChange }) => {
  const selectedOptions = options.filter((option) => option === value)

  return (
    <Dropdown
      value={selectedOptions?.[0] ?? ''}
      selectedOptions={selectedOptions}
      onOptionSelect={(e, data) =>
        onChange({ value: data.optionValue, previousValue: value })
      }
      clearable
    >
      {options.map((option) => {
        return <Option key={option}>{option}</Option>
      })}
    </Dropdown>
  )
}
