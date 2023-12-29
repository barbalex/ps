import { memo } from 'react'
import { Field } from '@fluentui/react-components'
import { TimePicker } from '@fluentui/react-timepicker-compat-preview'
import dayjs from 'dayjs'

export const TimeField = memo(
  ({
    label,
    value,
    name,
    onChange,
    validationMessage,
    validationState,
    autoFocus,
  }) => {
    const selectedTime = value ? dayjs(`2020-01-01 ${value}`) : null
    console.log('TimeField', {
      value,
      label,
      name,
      selectedTime,
    })

    return (
      <Field
        label={label}
        validationMessage={validationMessage}
        validationState={validationState}
      >
        <TimePicker
          // placeholder="Select a time or click to write..."
          name={name}
          freeform
          startHour={8}
          endHour={20}
          selectedTime={selectedTime}
          onTimeChange={(ev, data) => {
            console.log('onChange', { ev, data })
            const date = data.selectedTime
            const timeString = date ? dayjs(date).format('HH:mm') : ''
            console.log('onChange', { date, timeString })
            onChange({ target: { name, value: timeString } })
          }}
          onInput={(ev, data) => {
            console.log('onInput', { ev, data })
          }}
          // allowTextInput
          hourCycle="h23"
          formatDateToTimeString={(date) =>
            !date ? '' : dayjs(date).format('HH:mm')
          }
          autoFocus={autoFocus}
        />
      </Field>
    )
  },
)
