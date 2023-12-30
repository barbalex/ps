import { memo } from 'react'
import { Field, RadioGroup, Radio } from '@fluentui/react-components'


export const RadioGroupField = memo(
  ({
    name,
    label,
    list=[],
    value,
    onChange,
    validationMessage,
    validationState,
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
          {list.map((val) => (
            <Radio key={val} label={val} value={val} />
          ))}
        </RadioGroup>
      </Field>
    )
  },
)
