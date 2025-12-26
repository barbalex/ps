import { Field } from '@fluentui/react-components'
import { DatePicker } from '@fluentui/react-datepicker-compat'

import styles from './DateField.module.css'

export const DateField = ({
  label,
  value,
  name,
  onChange,
  validationMessage,
  validationState,
  autoFocus,
  ref,
  button,
}) => {
  // console.log('DateField', { value, label, name })

  return (
    <Field
      label={label}
      validationMessage={validationMessage}
      validationState={validationState}
    >
      <div className={styles.row}>
        <DatePicker
          placeholder="Select a date or click to write..."
          name={name}
          value={value}
          onChange={onChange}
          onSelectDate={(date) =>
            onChange({ target: { name, value: date, type: 'date' } })
          }
          firstDayOfWeek={1}
          allowTextInput
          formatDate={(date) =>
            !date ? '' : date?.toLocaleDateString?.('de-CH')
          }
          autoFocus={autoFocus}
          ref={ref}
          appearance="underline"
          className={styles.df}
        />
        {!!button && button}
      </div>
    </Field>
  )
}
