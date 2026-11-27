import { Field, Input } from '@fluentui/react-components'
import { useIntl } from 'react-intl'

import styles from './DateTimeField.module.css'
import { localDateTimeInput } from '../../modules/localDateTimeInput.ts'
import type { FieldChangeHandler } from './fieldChange.ts'

type Props = {
  label?: string
  name: string
  value: Date | null
  autoFocus?: boolean
  ref?: React.Ref<HTMLInputElement>
  onChange: FieldChangeHandler
  button?: React.ReactNode
  validationMessage?: string
  validationState?: 'error' | 'warning' | 'success' | 'none'
}

export const DateTimeField = ({
  label,
  name,
  value,
  autoFocus,
  ref,
  onChange,
  button,
  validationState,
  validationMessage,
}: Props) => {
  const { formatMessage } = useIntl()
  const initial =
    value && Number.isFinite(value.getTime()) ? localDateTimeInput(value) : ''
  return (
    <Field
      label={label ?? name}
      validationState={validationState}
      validationMessage={validationMessage}
    >
      <div className={styles.row}>
        <Input
          key={initial}
          name={name}
          type="datetime-local"
          step="any"
          defaultValue={initial}
          ref={ref}
          autoFocus={autoFocus}
          appearance="underline"
          onChange={(e) => e.currentTarget.setCustomValidity('')}
          onBlur={(e) => {
            const input = e.currentTarget
            // A skipped local hour (spring clock change) must not silently become a different time.
            if (
              input.value &&
              localDateTimeInput(new Date(input.value)) !== input.value
            ) {
              input.setCustomValidity(
                formatMessage({
                  id: 'localTimeInvalid',
                  defaultMessage: 'Diese Ortszeit existiert nicht.',
                }),
              )
            }
            if (input.reportValidity() && input.value !== initial) onChange(e)
          }}
        />
        {button}
      </div>
    </Field>
  )
}
