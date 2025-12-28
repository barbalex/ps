import { useState } from 'react'
import { Input, Field } from '@fluentui/react-components'

import styles from './TimeFields.module.css'

export const TimeFields = ({
  label,
  name,
  value = '',
  autoFocus,
  ref,
  onChange,
  button,
}) => {
  const valArray = (value ?? '').split(':')
  const [hours, setHours] = useState(valArray[0] ?? '')
  const [minutes, setMinutes] = useState(valArray[1] ?? '')

  const [hoursValidationState, hoursValidationMessage] =
    hours !== ''
      ? ['none', '']
      : minutes === ''
        ? ['none', '']
        : ['warning', 'must be set']

  const [minutesValidationState, minutesValidationMessage] =
    minutes !== ''
      ? ['none', '']
      : hours === ''
        ? ['none', '']
        : ['warning', 'must be set']

  const onChangeHours = (ev, data) => {
    const newHours = data.value
    setHours(newHours)
    if (minutes) {
      onChange({ target: { name, value: `${newHours}:${minutes}` } })
    }
  }

  const onChangeMinutes = (ev, data) => {
    const newMinutes = data.value
    setMinutes(newMinutes)
    if (hours) {
      onChange({ target: { name, value: `${hours}:${newMinutes}` } })
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
