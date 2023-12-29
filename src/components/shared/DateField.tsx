import { memo } from 'react'
import { Field } from '@fluentui/react-components'
import { DatePicker } from '@fluentui/react-datepicker-compat'

export const DateField = memo(
  ({
    label,
    value,
    name,
    onChange,
    validationMessage,
    validationState,
    autoFocus,
  }) => {
    // console.log('DateField', { value, label, name })

    return (
      <Field
        label={label}
        validationMessage={validationMessage}
        validationState={validationState}
      >
        <DatePicker
          placeholder="Select a date or click to write..."
          name={name}
          value={value}
          onChange={onChange}
          onSelectDate={(date) => onChange({ target: { name, value: date } })}
          firstDayOfWeek={1}
          allowTextInput
          formatDate={(date) => (!date ? '' : date.toLocaleDateString('de-CH'))}
          autoFocus={autoFocus}
          appearance="underline"
        />
      </Field>
    )
  },
)
