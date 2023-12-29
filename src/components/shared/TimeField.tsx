import { memo } from 'react'
import { Field } from '@fluentui/react-components'
import {
  TimePicker,
  formatDateToTimeString,
} from '@fluentui/react-timepicker-compat-preview'

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
    console.log('TimeField', {
      value,
      label,
      name,
      selectedTime: value ? new Date(formatDateToTimeString(value)) : '',
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
          startHour={8}
          endHour={20}
          selectedTime={value ? formatDateToTimeString(new Date(value)) : ''}
          onTimeChange={(ev, data) => {
            console.log('onChange', { ev, data })
            onChange({ target: { name, value: data.selectedTimeText } })
          }}
          // allowTextInput
          hourCycle="h23"
          formatDateToTimeString={(date) =>
            !date
              ? ''
              : date.toLocaleDateString('de-CH', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
          }
          autoFocus={autoFocus}
        />
      </Field>
    )
  },
)
