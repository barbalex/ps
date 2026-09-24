import type { FieldProps } from '@puckeditor/core'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches Puck's override signature
type CheckboxFieldProps = FieldProps<any, any> & {
  children: React.ReactNode
  name: string
  label?: React.ReactNode
  Label?: (props: {
    children: React.ReactNode
    label?: React.ReactNode
    icon?: React.ReactNode
  }) => React.ReactElement
}

/**
 * Puck has no built-in checkbox field type, but the design configs use one
 * (e.g. TitleBlock's showDate). Registered via Puck's fieldTypes override so
 * the value stays a real boolean — a select field would store strings.
 */
export const PuckCheckboxField = ({
  value = false,
  onChange,
  name,
  label,
  Label,
}: CheckboxFieldProps) => {
  const input = (
    <input
      type="checkbox"
      checked={!!value}
      onChange={(e) => onChange(e.target.checked)}
    />
  )
  if (!Label) return input
  return <Label label={label ?? name}>{input}</Label>
}
