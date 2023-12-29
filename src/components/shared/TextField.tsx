import { memo } from 'react'
import { Input, Field } from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'

export const TextField = memo((props: InputProps) => {
  const { label, validationMessage, validationState, autoFocus } = props

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
    >
      <Input {...props} appearance="underline" autoFocus={autoFocus} />
    </Field>
  )
})
