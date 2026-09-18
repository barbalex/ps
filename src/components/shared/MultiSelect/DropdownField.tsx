import * as fluentUiReactComponents from '@fluentui/react-components'
const { Dropdown, Option } = fluentUiReactComponents

export type MultiSelectOption = {
  label?: React.ReactNode
  value?: string | null
}

type Props = {
  placeholder?: string
  options: MultiSelectOption[]
  value?: string | null
  onChange: (data: {
    value: string | undefined
    previousValue: { value?: string } | undefined
  }) => void
}

export const DropdownField = ({ options, value, onChange }: Props) => {
  const selectedOptions = options.filter((option) => option.value === value)

  return (
    <Dropdown
      value={(selectedOptions?.[0] ?? '') as string}
      selectedOptions={selectedOptions as unknown as string[]}
      onOptionSelect={(_e: unknown, data: { optionValue?: string }) =>
        onChange({
          value: data.optionValue,
          previousValue: value as { value?: string } | undefined,
        })
      }
      clearable
    >
      {options.map((option) => (
        <Option key={option.value} value={option.value as string}>
          {option.label as string}
        </Option>
      ))}
    </Dropdown>
  )
}
