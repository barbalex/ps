import * as fluentUiReactComponents from '@fluentui/react-components'
const { Switch, Field } = fluentUiReactComponents
type SwitchProps = React.ComponentProps<typeof Switch>
type FieldProps = React.ComponentProps<typeof Field>

import styles from './SwitchField.module.css'

type Props = Omit<SwitchProps, 'checked' | 'value' | 'onChange'> &
  Pick<
    FieldProps,
    'validationMessage' | 'validationState' | 'hint'
  > & {
    value?: boolean | null
    button?: React.ReactNode
    onChange?: (ev: React.ChangeEvent<HTMLInputElement>, data?: any) => void
  }

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
  hint,
  ref,
}: Props) => {
  // ensure value is true, false or null
  const value = valueIn === true ? true : valueIn === false ? false : null

  return (
    <div className={styles.container}>
      <Field
        label={undefined}
        validationMessage={validationMessage}
        validationState={validationState}
        hint={hint}
      >
        <Switch
          label={label ?? '(no label provided)'}
          name={name}
          checked={value as boolean | undefined}
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
