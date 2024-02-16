import { memo, forwardRef } from 'react'
import { Input, Field } from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'

export const TextField = memo(
  forwardRef((props: InputProps, ref) => {
    const {
      label,
      validationMessage,
      validationState = 'none',
      autoFocus,
      value,
      disabled = false,
      button,
    } = props

    // console.log('hello TextField, props:', props)

    return (
      <Field
        label={label ?? '(no label provided)'}
        validationMessage={validationMessage}
        validationState={validationState}
      >
        <Input
          {...props}
          value={value ?? ''}
          appearance="underline"
          autoFocus={autoFocus}
          ref={ref}
          disabled={disabled}
        />
        {!!button && button}
      </Field>
    )
  }),
)
