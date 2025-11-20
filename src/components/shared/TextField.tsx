import { useState, useEffect } from 'react'
import { Input, Field } from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  columnGap: '10px',
  userSelect: 'none',
}
const fieldStyle = {
  width: '100%',
}

export const TextField = ({
  label,
  name,
  type = 'text',
  onChange: onChangeIn,
  hint,
  validationMessage,
  validationState = 'none',
  placeholder,
  autoFocus,
  value,
  disabled = false,
  button,
  ref,
}: InputProps) => {
  const [stateValue, setStateValue] = useState(
    value || value === 0 ? value : '',
  )

  useEffect(() => {
    setStateValue(value || value === 0 ? value : '')
  }, [value])

  const onChange = (event) => setStateValue(event.target.value)

  const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      onChangeIn(event)
    }
  }

  return (
    <Field
      label={label ?? name ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
      hint={hint}
      style={fieldStyle}
    >
      <div style={rowStyle}>
        <Input
          name={name}
          value={stateValue}
          type={type}
          placeholder={placeholder}
          appearance="underline"
          autoFocus={autoFocus}
          ref={ref}
          onChange={onChange}
          onKeyPress={onKeyPress}
          onBlur={onChangeIn}
          disabled={disabled}
          style={{ flexGrow: 1 }}
        />
        {!!button && button}
      </div>
    </Field>
  )
}
