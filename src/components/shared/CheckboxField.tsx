import { memo } from 'react'
import { 
  Checkbox, } from '@fluentui/react-components'

export const CheckboxField = memo(
  ({
    label = '(no label provided)',
    name,
    value = false,
    onChange,
    autoFocus,
  }) => (
    <Checkbox
      label={label}
      name={name}
      checked={value}
      onChange={onChange}
      autoFocus={autoFocus}
    />
  ),
)
