import { useState, useEffect } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Textarea, Field } = fluentUiReactComponents
type TextareaProps = React.ComponentProps<typeof Textarea>
type FieldProps = React.ComponentProps<typeof Field>

import styles from './TextArea.module.css'

type Props = Omit<Partial<TextareaProps>, 'onChange' | 'value'> &
  Pick<FieldProps, 'label' | 'validationMessage' | 'validationState'> & {
    onChange?: (
    ev: React.ChangeEvent<any>,
    data?: any,
  ) => void
    value?: string | number
    button?: React.ReactNode
  }

export const TextArea = (props: Props) => {
  const {
    label,
    name,
    validationMessage,
    validationState = 'none',
    autoFocus,
    button,
    onChange: onChangeIn,
    value,
    ref,
  } = props

  const [stateValue, setStateValue] = useState(
    value || value === 0 ? value : '',
  )
  useEffect(() => {
    setStateValue(value || value === 0 ? value : '')
  }, [value])

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
    setStateValue(event.target.value)

  // consumers pass Fluent's (ev, data) change handlers;
  // from key events only the event is available
  const onChangeEvent = onChangeIn as
    | ((event: React.SyntheticEvent<HTMLTextAreaElement>) => void)
    | undefined

  const onKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      onChangeEvent!(event)
    }
  }

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
      className={styles.field}
    >
      <div className={styles.row}>
        <Textarea
          {...props}
          name={name}
          value={stateValue as string}
          onChange={onChange}
          onKeyPress={onKeyPress}
          onBlur={onChangeEvent}
          appearance="outline"
          autoFocus={autoFocus}
          resize="vertical"
          className={styles.textarea}
          ref={ref}
        />
        {!!button && button}
      </div>
    </Field>
  )
}
