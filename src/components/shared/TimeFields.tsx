import { memo, useState, useCallback, useMemo } from 'react'
import { Input, Field } from '@fluentui/react-components'

export const TimeFields = memo(
  ({ label, name, value = '', autoFocus, onChange }) => {
    console.log('TimeFields', { value, label, name })
    const valArray = (value ?? '').split(':')
    const [hours, setHours] = useState(valArray[0] ?? '')
    const [minutes, setMinutes] = useState(valArray[1] ?? '')

    const [hoursValidationState, hoursValidationMessage] = useMemo(() => {
      if (hours !== '') return ['none', '']
      if (minutes === '') return ['none', '']
      return ['warning', 'must be set']
    }, [hours, minutes])
    const [minutesValidationState, minutesValidationMessage] = useMemo(() => {
      if (minutes !== '') return ['none', '']
      if (hours === '') return ['none', '']
      return ['warning', 'must be set']
    }, [hours, minutes])

    const onChangeHours = useCallback(
      (ev, data) => {
        const newHours = data.value
        setHours(newHours)
        if (minutes) {
          onChange({ target: { name, value: `${newHours}:${minutes}` } })
        }
      },
      [minutes, name, onChange],
    )
    const onChangeMinutes = useCallback(
      (ev, data) => {
        const newMinutes = data.value
        setMinutes(newMinutes)
        if (hours) {
          onChange({ target: { name, value: `${hours}:${newMinutes}` } })
        }
      },
      [hours, name, onChange],
    )

    return (
      <Field label={label ?? '(no label provided)'}>
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
              autoFocus={autoFocus}
            />
          </Field>
        </div>
      </Field>
    )
  },
)
