import { useState } from 'react'
import { Input, Field } from '@fluentui/react-components'
import { DatePicker } from '@fluentui/react-datepicker-compat'

import styles from './DateTimeField.module.css'

export const DateTimeField = ({
  label,
  name,
  value = '',
  autoFocus,
  ref,
  onChange,
  button,
}) => {
  const [years, setYears] = useState(value?.getFullYear?.() ?? '')
  const [months, setMonths] = useState(value?.getMonth?.() ?? '')
  const [days, setDays] = useState(value?.getDate?.() ?? '')
  const [hours, setHours] = useState(value?.getHours?.() ?? '')
  const [minutes, setMinutes] = useState(value?.getMinutes?.() ?? '')

  const [dateValidationState, dateValidationMessage] =
    !value && hours === '' && minutes === ''
      ? ['none', '']
      : years !== ''
        ? ['none', '']
        : ['warning', 'must be set']

  const [hoursValidationState, hoursValidationMessage] =
    !value && years === '' && minutes === ''
      ? ['none', '']
      : hours !== ''
        ? ['none', '']
        : ['warning', 'must be set']

  const [minutesValidationState, minutesValidationMessage] =
    !value && years === '' && hours === ''
      ? ['none', '']
      : minutes !== ''
        ? ['none', '']
        : ['warning', 'must be set']

  const onChangeDate = (ev) => {
    const newDate = ev?.target.value
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
      onChange({ target: { name, value: newDateTimeValue } })
    } else {
      if (!newDate && hours && minutes) {
        onChange({ target: { name, value: null } })
      }
    }
  }

  const onChangeHours = (ev, data) => {
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
      onChange({ target: { name, value: newDateTimeValue } })
    } else if (!years && !months && !days && !newHours && !minutes) {
      onChange({ target: { name, value: null } })
    }
  }

  const onChangeMinutes = (ev, data) => {
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
  }

  return (
    <Field label={label ?? '(no label provided)'}>
      <div className={styles.row}>
        <div className="field-group-horizontal">
          <Field
            label="Date"
            validationMessage={dateValidationMessage}
            validationState={dateValidationState}
          >
            <DatePicker
              placeholder="Select a date or click to write"
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
              formatDate={(date) => date?.toLocaleDateString?.('de-CH') ?? ''}
              autoFocus={autoFocus}
              ref={ref}
              appearance="underline"
            />
          </Field>
          <Field
            label="Hours"
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
            />
          </Field>
          <Field
            label="Minutes"
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
        {!!button && button}
      </div>
    </Field>
  )
}
