import { memo, useMemo } from 'react'
import { Dropdown, Field, Option } from '@fluentui/react-components'

export const DropdownFieldSimpleOptions = memo(
  ({
    name,
    label,
    options = [],
    value,
    onChange,
    validationMessage,
    validationState = 'none',
    ref,
  }) => {
    const selectedOptions = useMemo(
      () => options.filter((option) => option === value),
      [options, value],
    )

    return (
      <Field
        label={label ?? '(no label provided)'}
        validationMessage={validationMessage}
        validationState={validationState}
      >
        <Dropdown
          name={name}
          value={selectedOptions?.[0] ?? ''}
          selectedOptions={selectedOptions}
          onOptionSelect={(e, data) =>
            onChange({ target: { name, value: data.optionValue } })
          }
          appearance="underline"
          ref={ref}
          clearable
        >
          {options.map((option) => (
            <Option key={option}>{option}</Option>
          ))}
        </Dropdown>
      </Field>
    )
  },
)
