import { memo, useState, useCallback, useMemo } from 'react'
import { Input, Field } from '@fluentui/react-components'
import { DatePicker } from '@fluentui/react-datepicker-compat'

export const DateTimeField = memo(
  ({ label, name, value = '', autoFocus, onChange }) => {
    const [years, setYears] = useState(value?.getFullYear?.() ?? '')
    const [months, setMonths] = useState(value?.getMonth?.() ?? '')
    const [days, setDays] = useState(value?.getDate?.() ?? '')
    const [hours, setHours] = useState(value?.getHours?.() ?? '')
    const [minutes, setMinutes] = useState(value?.getMinutes?.() ?? '')

    console.log('DateTimeField', {
      value,
      label,
      name,
      years,
      months,
      days,hours,minutes
    })

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
        const newDate = ev?.target.value
        console.log('onChangeDate', { ev, newDate })
        const newYear = newDate?.getFullYear?.() ?? ''
        const newMonth = newDate?.getMonth?.() ?? ''
        const newDay = newDate?.getDate?.() ?? ''
        setYears(newYear)
        setMonths(newMonth)
        setDays(newDay)
        if (newDate) {
          const newDateTimeValue = new Date(
            newYear,
            newMonth,
            newDay,
            hours ?? 0,
            minutes ?? 0,
          )
          console.log('onChangeDate', {
            newYear,
            newMonth,
            newDay,
            hours,
            minutes,
            newDateTimeValue,
          })
          onChange({ target: { name, value: newDateTimeValue } })
        } else {
          if (!newDate && hours && minutes) {
            onChange({ target: { name, value: null } })
          }
        }
      },
      [hours, minutes, name, onChange],
    )

    const onChangeHours = useCallback(
      (ev, data) => {
        console.log('onChangeHours', { data, ev })
        const newHours = data.value ? +data.value : ''
        setHours(newHours)
        if (years && months && days && newHours && minutes) {
          const newDateTimeValue = new Date(
            years,
            months - 1,
            days,
            newHours,
            minutes,
          )
          // console.log('onChangeHours', {
          //   newHours,
          //   year,
          //   month,
          //   day,
          //   minutes,
          //   newDateTimeValue,
          // })
          onChange({ target: { name, value: newDateTimeValue } })
        } else if (!years && !months && !days && !newHours && !minutes) {
          onChange({ target: { name, value: null } })
        }
      },
      [days, minutes, months, name, onChange, years],
    )
    const onChangeMinutes = useCallback(
      (ev, data) => {
        console.log('onChangeMinutes', { data, ev })
        const newMinutes = data.value
        setMinutes(newMinutes)
        if (years && months && days && hours && newMinutes) {
          const newDateTimeValue = new Date(
            years,
            months - 1,
            days,
            hours,
            newMinutes,
          )
          onChange({ target: { name, value: newDateTimeValue } })
        } else if (!years && !months && !days && !hours && !newMinutes) {
          onChange({ target: { name, value: null } })
        }
      },
      [days, hours, months, name, onChange, years],
    )

    return (
      <Field label={label ?? '(no label provided)'}>
        <div className="field-group-horizontal">
          <Field label="Date">
            <DatePicker
              placeholder="Select a date or click to write..."
              name={name}
              value={
                years && months && days ? new Date(years, months, days) : null
              }
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
