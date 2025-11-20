import { Checkbox } from '@fluentui/react-components'

const containerStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
}

export const CheckboxField = ({
  label = '(no label provided)',
  name,
  value,
  onChange: onChangeIn,
  autoFocus,
  size = 'large',
  indeterminate = false,
  button,
  ref,
}) => {
  const onChange = (e, { checked }) => {
    // if was true, set null
    // if was false, set true
    // if was null, set false
    const newValue =
      indeterminate === false ? checked
      : value === true ? null
      : value === false ? true
      : false
    onChangeIn(e, { checked: newValue })
  }

  const checked =
    (value === null || value === '') && indeterminate === true ? 'mixed' : value

  return (
    <div style={containerStyle}>
      <Checkbox
        label={label}
        name={name}
        checked={checked}
        onChange={onChange}
        autoFocus={autoFocus}
        ref={ref}
        size={size}
      />
      {button ? button : null}
    </div>
  )
}
