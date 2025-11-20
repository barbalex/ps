import { useState, useEffect } from 'react'
import { Textarea, Field } from '@fluentui/react-components'
import type { TextareaProps } from '@fluentui/react-components'

import './textArea.css'

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  columnGap: '10px',
  userSelect: 'none',
}

const textareaStyle = {
  flexGrow: 1,
}

const fieldStyle = {
  width: '100%',
}

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
      style={fieldStyle}
    >
      <div style={rowStyle}>
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
          style={textareaStyle}
          ref={ref}
        />
        {!!button && button}
      </div>
    </Field>
  )
}
