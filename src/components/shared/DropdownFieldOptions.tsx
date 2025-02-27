import { memo, useMemo, useCallback } from 'react'
import { Dropdown, Field, Option } from '@fluentui/react-components'

export const DropdownFieldOptions = memo(
  ({
    name,
    label,
    options,
    value,
    onChange,
    autoFocus,
    validationMessage,
    validationState = 'none',
    ref,
  }) => {
    const onChangeOption = useCallback(
      (e, data) => onChange({ target: { name, value: data.optionValue } }),
      [name, onChange],
    )

    const selectedOptions = useMemo(
      () => options.filter(({ value: v }) => v === value),
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
          value={selectedOptions?.[0]?.value ?? ''}
          selectedOptions={selectedOptions}
          onOptionSelect={onChangeOption}
          appearance="underline"
          autoFocus={autoFocus}
          ref={ref}
          clearable
        >
          {options.map(({ label, value }) => (
            <Option
              key={value}
              value={value}
            >
              {label}
            </Option>
          ))}
        </Dropdown>
      </Field>
    )
  },
)
