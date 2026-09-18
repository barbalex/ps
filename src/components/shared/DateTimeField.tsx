import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Input, Field } = fluentUiReactComponents
import { DatePicker } from '@fluentui/react-datepicker-compat'
import { useIntl } from 'react-intl'

import styles from './DateTimeField.module.css'

type InputProps = React.ComponentProps<typeof Input>
type InputOnChangeData = Parameters<NonNullable<InputProps['onChange']>>[1]
type DatePickerProps = React.ComponentProps<typeof DatePicker>
type DatePickerOnChange = NonNullable<DatePickerProps['onChange']>

type Props = {
  label?: string
  name?: string
  value?: Date | null | ''
  autoFocus?: boolean
  ref?: React.Ref<HTMLInputElement>
  onChange: (
    ev: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData,
  ) => void
  button?: React.ReactNode
  validationMessage?: React.ReactNode
  validationState?: 'error' | 'warning' | 'success' | 'none'
}

export const DateTimeField = ({
  label,
  name,
  value = '',
  autoFocus,
  ref,
  onChange,
  button,
}: Props) => {
  // consumers pass Fluent's (ev, data) change handlers; called here with fake events
  const onChangeFake = onChange as unknown as (e: {
    target: { name?: string; value: Date | null }
  }) => void
  const { formatMessage } = useIntl()
  const mustBeSetMessage = formatMessage({
    id: 'dtFieldMustBeSet',
    defaultMessage: 'muss gesetzt werden',
  })
  const dateLabel = formatMessage({
    id: 'dtFieldDate',
    defaultMessage: 'Datum',
  })
  const datePlaceholder = formatMessage({
    id: 'dtFieldSelectDate',
    defaultMessage: 'Datum auswählen oder tippen',
  })
  const hoursLabel = formatMessage({
    id: 'dtFieldHours',
    defaultMessage: 'Stunden',
  })
  const minutesLabel = formatMessage({
    id: 'dtFieldMinutes',
    defaultMessage: 'Minuten',
  })
  const [years, setYears] = useState(
    (value as Date | undefined)?.getFullYear?.() ?? '',
  )
  const [months, setMonths] = useState(
    (value as Date | undefined)?.getMonth?.() ?? '',
  )
  const [days, setDays] = useState(
    (value as Date | undefined)?.getDate?.() ?? '',
  )
  const [hours, setHours] = useState(
    (value as Date | undefined)?.getHours?.() ?? '',
  )
  const [minutes, setMinutes] = useState(
    (value as Date | undefined)?.getMinutes?.() ?? '',
  )

  const [dateValidationState, dateValidationMessage]: [
    'none' | 'warning',
    string,
  ] =
    !value && hours === '' && minutes === ''
      ? ['none', '']
      : years !== ''
        ? ['none', '']
        : ['warning', mustBeSetMessage]

  const [hoursValidationState, hoursValidationMessage]: [
    'none' | 'warning',
    string,
  ] =
    !value && years === '' && minutes === ''
      ? ['none', '']
      : hours !== ''
        ? ['none', '']
        : ['warning', mustBeSetMessage]

  const [minutesValidationState, minutesValidationMessage]: [
    'none' | 'warning',
    string,
  ] =
    !value && years === '' && hours === ''
      ? ['none', '']
      : minutes !== ''
        ? ['none', '']
        : ['warning', mustBeSetMessage]

  const onChangeDate = (ev: { target?: { name?: string; value?: Date | null } }) => {
    const newDate = ev?.target?.value
    const newYear = newDate?.getFullYear?.() ?? ''
    const newMonth = newDate?.getMonth?.() ?? ''
    const newDay = newDate?.getDate?.() ?? ''
    setYears(newYear)
    setMonths(newMonth)
    setDays(newDay)
    if (newDate) {
      const newDateTimeValue = new Date(
        newYear as number,
        newMonth as number,
        newDay as number,
        (hours ?? 0) as number,
        (minutes ?? 0) as number,
      )
      onChangeFake({ target: { name, value: newDateTimeValue } })
    } else {
      if (!newDate && hours && minutes) {
        onChangeFake({ target: { name, value: null } })
      }
    }
  }

  const onChangeHours = (_ev: unknown, data: { value?: string }) => {
    const newHours = data.value ? +data.value : ''
    setHours(newHours)
    if (years && months && days && newHours && minutes) {
      const newDateTimeValue = new Date(
        years as number,
        (months as number) - 1,
        days as number,
        newHours as number,
        minutes as number,
      )
      onChangeFake({ target: { name, value: newDateTimeValue } })
    } else if (!years && !months && !days && !newHours && !minutes) {
      onChangeFake({ target: { name, value: null } })
    }
  }

  const onChangeMinutes = (_ev: unknown, data: { value?: string }) => {
    const newMinutes = data.value
    setMinutes(newMinutes as string | number)
    if (years && months && days && hours && newMinutes) {
      const newDateTimeValue = new Date(
        years as number,
        (months as number) - 1,
        days as number,
        hours as number,
        newMinutes as unknown as number,
      )
      onChangeFake({ target: { name, value: newDateTimeValue } })
    } else if (!years && !months && !days && !hours && !newMinutes) {
      onChangeFake({ target: { name, value: null } })
    }
  }

  return (
    <Field label={label ?? '(no label provided)'}>
      <div className={styles.row}>
        <div className="field-group-horizontal">
          <Field
            label={dateLabel}
            validationMessage={dateValidationMessage}
            validationState={dateValidationState}
          >
            <DatePicker
              placeholder={datePlaceholder}
              name={name}
              value={
                years && months && days
                  ? new Date(years as number, months as number, days as number)
                  : null
              }
              onChange={onChangeDate as unknown as DatePickerOnChange}
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
            label={hoursLabel}
            validationMessage={hoursValidationMessage}
            validationState={hoursValidationState}
          >
            <Input
              value={hours as string}
              type="number"
              min={0}
              max={23}
              onChange={onChangeHours}
              appearance="underline"
            />
          </Field>
          <Field
            label={minutesLabel}
            validationMessage={minutesValidationMessage}
            validationState={minutesValidationState}
          >
            <Input
              value={minutes as string}
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
