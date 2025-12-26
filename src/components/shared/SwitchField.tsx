import { Switch, Field } from '@fluentui/react-components'

import styles from './SwitchField.module.css'

export const SwitchField = ({
  label,
  name,
  value: valueIn,
  onChange,
  autoFocus,
  disabled = false,
  validationMessage,
  validationState = 'none',
  button,
  ref,
}) => {
  // ensure value is true, false or null
  const value = valueIn === true ? true : valueIn === false ? false : null

  return (
    <div className={styles.container}>
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
  )
}
