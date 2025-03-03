import { memo } from 'react'
import { Switch, Field } from '@fluentui/react-components'

const containerStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
}

export const SwitchField = memo(
  ({
    label,
    name,
    value = false,
    onChange,
    autoFocus,
    disabled = false,
    validationMessage,
    validationState = 'none',
    button,
    ref,
  }) => (
    <div style={containerStyle}>
      <Field
        label={undefined}
        validationMessage={validationMessage}
        validationState={validationState}
      >
        <Switch
          label={label ?? '(no label provided)'}
          name={name}
          checked={value}
          onChange={onChange}
          autoFocus={autoFocus}
          ref={ref}
          disabled={disabled}
        />
      </Field>
      {button ? button : null}
    </div>
  ),
)
