import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Input, Field } = fluentUiReactComponents
type InputProps = React.ComponentProps<typeof Input>
type InputOnChangeData = Parameters<NonNullable<InputProps['onChange']>>[1]
type FieldProps = React.ComponentProps<typeof Field>

import styles from './TimeFields.module.css'

type Props = {
  label?: string
  name: string
  value?: string
  autoFocus?: boolean
  ref?: InputProps['ref']
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  button?: React.ReactNode
  // accepted for consistency with other fields but not used
  validationMessage?: FieldProps['validationMessage']
  validationState?: FieldProps['validationState']
}

export const TimeFields = ({
  label,
  name,
  value = '',
  autoFocus,
  ref,
  onChange,
  button,
}: Props) => {
  const valArray = (value ?? '').split(':')
  const [hours, setHours] = useState(valArray[0] ?? '')
  const [minutes, setMinutes] = useState(valArray[1] ?? '')

  const [hoursValidationState, hoursValidationMessage] =
    hours !== ''
      ? (['none', ''] as const)
      : minutes === ''
        ? (['none', ''] as const)
        : (['warning', 'must be set'] as const)

  const [minutesValidationState, minutesValidationMessage] =
    minutes !== ''
      ? (['none', ''] as const)
      : hours === ''
        ? (['none', ''] as const)
        : (['warning', 'must be set'] as const)

  const onChangeHours = (
    _ev: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData,
  ) => {
    const newHours = data.value
    setHours(newHours)
    if (minutes) {
      onChange({
        target: { name, value: `${newHours}:${minutes}` },
      } as unknown as React.ChangeEvent<HTMLInputElement>)
    }
  }

  const onChangeMinutes = (
    _ev: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData,
  ) => {
    const newMinutes = data.value
    setMinutes(newMinutes)
    if (hours) {
      onChange({
        target: { name, value: `${hours}:${newMinutes}` },
      } as unknown as React.ChangeEvent<HTMLInputElement>)
    }
  }

  return (
    <Field label={label ?? '(no label provided)'}>
      <div className={styles.row}>
        <div className="field-group-horizontal">
          <Field
            label="hours"
            validationMessage={hoursValidationMessage}
            validationState={hoursValidationState}
          >
            <Input
              value={hours}
              type="number"
              min={0}
              max={23}
              onChange={onChangeHours}
              appearance="underline"
              autoFocus={autoFocus}
              ref={ref}
            />
          </Field>
          <Field
            label="minutes"
            validationMessage={minutesValidationMessage}
            validationState={minutesValidationState}
          >
            <Input
              value={minutes}
              type="number"
              min={0}
              max={59}
              onChange={onChangeMinutes}
              appearance="underline"
            />
          </Field>
        </div>
        {button && button}
      </div>
    </Field>
  )
}
