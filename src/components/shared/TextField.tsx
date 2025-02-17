import { memo, forwardRef } from 'react'
import { Input, Field } from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  columnGap: '10px',
  userSelect: 'none',
}

export const TextField = memo(
  forwardRef((props: InputProps, ref) => {
    const {
      label,
      hint,
      validationMessage,
      validationState = 'none',
      placeholder,
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
        hint={hint}
      >
        <div style={rowStyle}>
          <Input
            {...props}
            value={value ?? ''}
            placeholder={placeholder}
            appearance="underline"
            autoFocus={autoFocus}
            ref={ref}
            disabled={disabled}
            style={{ flexGrow: 1 }}
          />
          {!!button && button}
        </div>
      </Field>
    )
  }),
)
