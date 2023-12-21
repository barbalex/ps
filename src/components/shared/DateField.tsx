import type { InputProps } from '@fluentui/react-components'
import { Field } from '@fluentui/react-components'
import { DatePicker } from '@fluentui/react-datepicker-compat'

export const DateField = (props: InputProps) => {
  const { label, value, name, onChange } = props

  return (
    <Field label={label}>
      <DatePicker
        placeholder="Select a date or click to write..."
        name={name}
        value={value}
        onChange={onChange}
        onSelectDate={(date) => onChange({ target: { name, value: date } })}
        firstDayOfWeek={1}
        allowTextInput
        formatDate={(date) => (!date ? '' : date.toLocaleDateString('de-CH'))}
      />
    </Field>
  )
}
