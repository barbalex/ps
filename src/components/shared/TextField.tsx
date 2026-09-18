import { useState, useEffect } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Input, Field } = fluentUiReactComponents
type InputProps = React.ComponentProps<typeof Input>
type FieldProps = React.ComponentProps<typeof Field>

import styles from './TextField.module.css'

type Props = Omit<InputProps, 'onChange' | 'value'> &
  Pick<
    FieldProps,
    'label' | 'hint' | 'validationMessage' | 'validationState'
  > & {
    onChange?: (
    ev: React.ChangeEvent<any>,
    data?: any,
  ) => void
    value?: string | number
    button?: React.ReactNode
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
  tabIndex,
  readOnly,
}: Props) => {
  const [stateValue, setStateValue] = useState(
    value || value === 0 ? value : '',
  )

  useEffect(() => {
    setStateValue(value || value === 0 ? value : '')
  }, [value])

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setStateValue(event.target.value)

  // consumers pass Fluent's (ev, data) change handlers;
  // from key events only the event is available
  const onChangeEvent = onChangeIn as
    | ((event: React.SyntheticEvent<HTMLInputElement>) => void)
    | undefined

  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onChangeEvent!(event)
    }
  }

  const onKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const inFilterForm = !!(event.target as HTMLElement | null)?.closest?.(
      '.form-container.filter',
    )
    if (inFilterForm) {
      onChangeEvent!(event)
    }
  }

  return (
    <Field
      label={label ?? name ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
      hint={hint}
      className={styles.field}
    >
      <div className={styles.row}>
        <Input
          name={name}
          value={stateValue as string}
          type={type}
          placeholder={placeholder}
          appearance="underline"
          autoFocus={autoFocus}
          ref={ref}
          onChange={onChange}
          onKeyPress={onKeyPress}
          onKeyUp={onKeyUp}
          onBlur={onChangeEvent}
          disabled={disabled}
          className={styles.input}
          tabIndex={tabIndex}
          readOnly={readOnly}
        />
        {!!button && button}
      </div>
    </Field>
  )
}
