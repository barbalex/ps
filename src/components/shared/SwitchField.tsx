import { memo } from 'react'
import { Switch, Field } from '@fluentui/react-components'

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
  }) => (
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
        disabled={disabled}
      />
    </Field>
  ),
)
