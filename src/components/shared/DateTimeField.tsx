import { memo, useState, useCallback, useMemo } from 'react'
import { Input, Field } from '@fluentui/react-components'
import { DatePicker } from '@fluentui/react-datepicker-compat'

export const DateTimeField = memo(
  ({ label, name, value = '', autoFocus, onChange }) => {
    const [year, setYear] = useState(value?.getFullYear?.() ?? '')
    const [month, setMonth] = useState(value?.getMonth?.() ?? '')
    const [day, setDay] = useState(value?.getDate?.() ?? '')
    const [hours, setHours] = useState(value?.getHours?.() ?? '')
    const [minutes, setMinutes] = useState(value?.getMinutes?.() ?? '')

    const [hoursValidationState, hoursValidationMessage] = useMemo(() => {
      if (!value) return ['none', '']
      if (hours !== '') return ['none', '']
      if (minutes === '') return ['none', '']
      return ['warning', 'must be set']
    }, [hours, minutes, value])
    const [minutesValidationState, minutesValidationMessage] = useMemo(() => {
      if (!value) return ['none', '']
      if (minutes !== '') return ['none', '']
      if (hours === '') return ['none', '']
      return ['warning', 'must be set']
    }, [hours, minutes, value])

    const onChangeDate = useCallback(
      (ev) => {
        console.log('onChangeDate', { ev })
        const newDate = event?.target.value
        const newYear = newDate?.getFullYear?.() ?? ''
        const newMonth = newDate?.getMonth?.() ?? ''
        const newDay = newDate?.getDate?.() ?? ''
        setYear(newYear)
        setMonth(newMonth)
        setDay(newDay)
        if (newDate) {
          const newDateTimeValue = new Date()
          newDateTimeValue.setFullYear(newYear)
          newDateTimeValue.setMonth(newMonth)
          newDateTimeValue.setDate(newDay)
          newDateTimeValue.setHours(hours)
          newDateTimeValue.setMinutes(minutes)
          onChange({ target: { name, value: newDateTimeValue } })
        }
      },
      [hours, minutes, name, onChange],
    )

    const onChangeHours = useCallback(
      (ev, data) => {
        console.log('onChangeHours', { data, ev })
        const newHours = data.value
        setHours(newHours)
        if (minutes && value) {
          const newDateTimeValue = new Date()
          newDateTimeValue.setFullYear(year)
          newDateTimeValue.setMonth(month)
          newDateTimeValue.setDate(day)
          newDateTimeValue.setHours(newHours)
          newDateTimeValue.setMinutes(minutes)
          onChange({ target: { name, value: newDateTimeValue } })
        }
      },
      [day, minutes, month, name, onChange, value, year],
    )
    const onChangeMinutes = useCallback(
      (ev, data) => {
        console.log('onChangeMinutes', { data, ev })
        const newMinutes = data.value
        setMinutes(newMinutes)
        if (hours && value) {
          const newDateTimeValue = new Date()
          newDateTimeValue.setFullYear(year)
          newDateTimeValue.setMonth(month)
          newDateTimeValue.setDate(day)
          newDateTimeValue.setHours(hours)
          newDateTimeValue.setMinutes(newMinutes)
          onChange({ target: { name, value: newDateTimeValue } })
        }
      },
      [day, hours, month, name, onChange, value, year],
    )

    return (
      <Field label={label ?? '(no label provided)'}>
        <div className="field-group-horizontal">
          <Field label="Date">
            <DatePicker
              placeholder="Select a date or click to write..."
              name={name}
              value={value}
              onChange={onChangeDate}
              onSelectDate={(date) =>
                onChangeDate({ target: { name, value: date } })
              }
              firstDayOfWeek={1}
              allowTextInput
              formatDate={(date) => {
                console.log('formatDate, date:', date)
                return date?.toLocaleDateString?.('de-CH') ?? ''
              }}
              autoFocus={autoFocus}
              appearance="underline"
            />
          </Field>
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
