import { memo } from 'react'
import { Switch } from '@fluentui/react-components'

export const SwitchField = memo(
  ({
    label = '(no label provided)',
    name,
    value = false,
    onChange,
    autoFocus,
  }) => (
    <Switch
      label={label}
      name={name}
      checked={value}
      onChange={onChange}
      autoFocus={autoFocus}
    />
  ),
)
