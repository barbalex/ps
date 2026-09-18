import * as fluentUiReactComponents from '@fluentui/react-components'
const { Field } = fluentUiReactComponents
type InputProps = React.ComponentProps<typeof fluentUiReactComponents.Input>
type FieldProps = React.ComponentProps<typeof Field>
import { IMaskInput } from 'react-imask'

type Props = Omit<InputProps, 'onChange'> &
  Pick<FieldProps, 'label' | 'validationMessage' | 'validationState'> & {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  }

export const TimeFieldMasked = (props: Props) => {
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
          onChange!({
            target: { name, value },
          } as unknown as React.ChangeEvent<HTMLInputElement>)
        }}
        type="text"
      />
    </Field>
  )
}
