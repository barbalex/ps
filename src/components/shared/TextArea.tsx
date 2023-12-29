import { memo } from 'react'
import { Textarea, Field } from '@fluentui/react-components'
import type { TextareaProps } from '@fluentui/react-components'

export const TextArea = memo((props: Partial<TextareaProps>) => {
  const { label, validationMessage, validationState, autoFocus } = props

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
    >
      <Textarea
        {...props}
        appearance="underline"
        autoFocus={autoFocus}
        resize="vertical"
      />
    </Field>
  )
})
