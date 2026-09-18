import * as fluentUiReactComponents from '@fluentui/react-components'
const { Dropdown, Option } = fluentUiReactComponents

type Props = {
  options: string[]
  value?: string
  // accepted but not used
  placeholder?: string
  onChange: (data: { value?: string; previousValue?: string }) => void
}

export const DropdownField = ({ options, value, onChange }: Props) => {
  const selectedOptions = options.filter((option) => option === value)

  return (
    <Dropdown
      value={selectedOptions?.[0] ?? ''}
      selectedOptions={selectedOptions}
      onOptionSelect={(_e, data) =>
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
