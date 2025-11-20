import { Field } from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'
import { IMaskInput } from 'react-imask'

export const TimeFieldMasked = (props: InputProps) => {
  const {
    name,
    label,
    validationMessage,
    validationState,
    autoFocus,
    onChange,
  } = props

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
    >
      <IMaskInput
        className="imask-input"
        autoFocus={autoFocus}
        mask="X0:Y0"
        definitions={{ X: /[0-2]/, Y: /[0-5]/ }}
        lazy={false}
        overwrite="shift"
        onAccept={(value) => {
          if (value.includes('_')) return
          console.log('onAccept', { value })
          onChange({ target: { name, value } })
        }}
        type="text"
      />
    </Field>
  )
}
