import { Field } from '@fluentui/react-components'
import { TimePicker } from '@fluentui/react-timepicker-compat'
import dayjs from 'dayjs'
// import { format } from "@formkit/tempo"
import styles from './TimeField.module.css'

export const TimeField = ({
  label,
  value,
  name,
  onChange,
  validationMessage,
  validationState,
  autoFocus,
  button,
}) => {
  const selectedTime = value ? new Date(`2020-01-01T${value}:00Z`) : null
  console.log('TimeField', {
    value,
    name,
    selectedTime,
  })

  return (
    <Field
      label={label}
      validationMessage={validationMessage}
      validationState={validationState}
    >
      <div className={styles.row}>
        <TimePicker
          placeholder="Select a time or click to write..."
          name={name}
          // TODO: when freeform is active, blur sets value to ''!
          freeform
          startHour={8}
          endHour={20}
          hourCycle="h23"
          selectedTime={selectedTime}
          onTimeChange={(ev, data) => {
            const date = data.selectedTime
            const timeString = date ? dayjs(date).format('HH:mm') : ''
            console.log('onTimeChange', { ev, data, date, timeString })
            // if (ev.type === 'blur') return
            onChange({ target: { name, value: timeString } })
          }}
          formatDateToTimeString={(date) =>
            !date ? '' : dayjs(date).format('HH:mm')
          }
          parseTimeStringToDate={(timeString) =>
            !timeString ? '' : new Date(`2020-01-01T${timeString}:00Z`)
          }
          autoFocus={autoFocus}
          appearance="underline"
        />
        {!!button && button}
      </div>
    </Field>
  )
}
