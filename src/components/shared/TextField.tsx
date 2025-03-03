import { memo, useState, useCallback, useEffect } from 'react'
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
  ({
    label,
    name,
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
    const onChange = useCallback(
      (event) => setStateValue(event.target.value),
      [],
    )
    useEffect(() => {
      setStateValue(value || value === 0 ? value : '')
    }, [value])

    const onKeyPress = useCallback(
      (event) => {
        if (event.key === 'Enter') {
          onChangeIn(event)
        }
      },
      [onChangeIn],
    )

    return (
      <Field
        label={label ?? name ?? '(no label provided)'}
        validationMessage={validationMessage}
        validationState={validationState}
        hint={hint}
      >
        <div style={rowStyle}>
          <Input
            name={name}
            value={stateValue}
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
  },
)
