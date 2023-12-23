import { memo } from 'react'
import {
  Input,
  Field,
} from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'

export const TextField = memo((props: InputProps) => {
  const { label } = props

  return (
    <Field label={label ?? '(no label provided)'} >
      <Input {...props} appearance="underline" />
    </Field>
  )
})
