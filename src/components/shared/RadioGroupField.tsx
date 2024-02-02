import { memo } from 'react'
import { Field, RadioGroup, Radio } from '@fluentui/react-components'

export const RadioGroupField = memo(
  ({
    name,
    label,
    list = [],
    value,
    onChange,
    validationMessage,
    validationState,
    autoFocus,
  }) => {
    return (
      <Field
        label={label ?? '(no label provided)'}
        validationMessage={validationMessage}
        validationState={validationState}
      >
        <RadioGroup
          layout="horizontal"
          name={name}
          value={value}
          onChange={onChange}
          appearance="underline"
        >
          {list.map((val, index) => (
            <Radio
              key={val}
              label={val}
              value={val}
              autoFocus={index === 0 && autoFocus}
            />
          ))}
        </RadioGroup>
      </Field>
    )
  },
)
