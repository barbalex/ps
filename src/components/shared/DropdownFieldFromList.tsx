import * as fluentUiReactComponents from '@fluentui/react-components'
const { Dropdown, Field, Option } = fluentUiReactComponents
import { useLiveQuery } from '@electric-sql/pglite-react'

import styles from './DropdownFieldFromList.module.css'

interface Props {
  name: string
  label?: string
  list_id: string
  value: string
  onChange: () => void
  validationMessage?: string
  validationState?: string
  button?: React.ReactNode
}

export const DropdownFieldFromList = ({
  name,
  label,
  list_id,
  value,
  onChange,
  autoFocus,
  ref,
  validationMessage,
  validationState,
  button,
}: Props) => {
  const res = useLiveQuery(
    `SELECT lv.list_value_id, lv.label, l.value_type,
      lv.value_integer, lv.value_numeric, lv.value_text, lv.value_date, lv.value_datetime
     FROM list_values lv
     JOIN lists l ON l.list_id = lv.list_id
     WHERE lv.list_id = $1`,
    [list_id],
  )
  const rows = res?.rows ?? []
  const valueType = rows[0]?.value_type ?? null
  const valueColumn = valueType ? `value_${valueType}` : null

  const selectedRow = valueColumn
    ? rows.find((row) => String(row[valueColumn]) === String(value))
    : undefined
  const selectedOptions = selectedRow ? [selectedRow.list_value_id] : []

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
      className={styles.field}
    >
      <div className={styles.row}>
        <Dropdown
          name={name}
          value={selectedRow?.label ?? ''}
          selectedOptions={selectedOptions}
          onOptionSelect={(e, data) => {
            const row = rows.find((r) => r.list_value_id === data.optionValue)
            if (!row) return
            if (!row.value_type)
              throw new Error(`List ${list_id} has no value_type set`)
            onChange({
              target: { name, value: row[`value_${row.value_type}`] },
            })
          }}
          appearance="underline"
          className={styles.dd}
          autoFocus={autoFocus}
          ref={ref}
          clearable
        >
          {rows.map((row) => (
            <Option key={row.list_value_id} value={row.list_value_id}>
              {row.label}
            </Option>
          ))}
        </Dropdown>
        {!!button && button}
      </div>
    </Field>
  )
}
