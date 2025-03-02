import { memo } from 'react'
import { Checkbox } from '@fluentui/react-components'

const containerStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
}

export const CheckboxField = memo(
  ({
    label = '(no label provided)',
    name,
    value = false,
    onChange,
    autoFocus,
    size = 'large',
    indeterminate = false,
    button,
  }) => (
    <div style={containerStyle}>
      <Checkbox
        label={label}
        name={name}
        checked={value}
        onChange={onChange}
        autoFocus={autoFocus}
        size={size}
        mixed={indeterminate}
      />
      {button ? button : null}
    </div>
  ),
)
