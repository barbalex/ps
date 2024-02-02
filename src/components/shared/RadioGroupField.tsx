import { memo, forwardRef } from 'react'
import { Field, RadioGroup, Radio } from '@fluentui/react-components'

export const RadioGroupField = memo(
  forwardRef((props, ref) => {
    const {
      name,
      label,
      list = [],
      value,
      onChange,
      validationMessage,
      validationState,
      autoFocus,
    } = props

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
              ref={index === 0 ? ref : undefined}
            />
          ))}
        </RadioGroup>
      </Field>
    )
  }),
)
