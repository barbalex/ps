import { memo, forwardRef } from 'react'
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

export const TextArea = memo(
  forwardRef((props: Partial<TextareaProps>, ref) => {
    const {
      label,
      validationMessage,
      validationState = 'none',
      autoFocus,
      button,
    } = props

    return (
      <Field
        label={label ?? '(no label provided)'}
        validationMessage={validationMessage}
        validationState={validationState}
      >
        <div style={rowStyle}>
          <Textarea
            {...props}
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
  }),
)
