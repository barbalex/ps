import { useState, useEffect } from 'react'
import { Textarea, Field } from '@fluentui/react-components'
import type { TextareaProps } from '@fluentui/react-components'

import styles from './TextArea.module.css'

export const TextArea = (props: Partial<TextareaProps>) => {
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

  const onChange = (event) => setStateValue(event.target.value)

  const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      onChangeIn(event)
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
          value={stateValue}
          onChange={onChange}
          onKeyPress={onKeyPress}
          onBlur={onChangeIn}
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
