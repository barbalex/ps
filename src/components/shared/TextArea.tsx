import { memo, useState, useCallback, useEffect } from 'react'
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

export const TextArea = memo((props: Partial<TextareaProps>) => {
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
  const onChange = useCallback((event) => setStateValue(event.target.value), [])
  useEffect(() => {
    setStateValue(value || value === 0 ? value : '')
  }, [value])

  const onKeyPress = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        onChangeIn(event)
      }
    },
    [onChangeIn],
  )

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
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
})
