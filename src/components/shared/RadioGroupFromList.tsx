import * as fluentUiReactComponents from '@fluentui/react-components'
const { Field, RadioGroup, Radio } = fluentUiReactComponents
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Loading } from './Loading.tsx'
import styles from './RadioGroupFromList.module.css'

type FieldProps = React.ComponentProps<typeof Field>

type Props = {
  name: string
  label?: string
  list_id: string
  value: string
  onChange: (
    ev: React.ChangeEvent<HTMLInputElement>,
    data?: { value?: string | null },
  ) => void
  validationMessage?: FieldProps['validationMessage']
  validationState?: 'error' | 'warning' | 'success' | 'none'
  autoFocus?: boolean
  ref?: React.Ref<HTMLInputElement>
  button?: React.ReactNode
}

type ListValueRow = Record<string, unknown> & {
  list_value_id: string
  label?: string | null
  value_type?: string | null
}

export const RadioGroupFromList = ({
  name,
  label,
  list_id,
  value: rowValue,
  onChange: onChangePassed,
  validationMessage,
  validationState,
  autoFocus,
  ref,
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
  const rows = (res?.rows ?? []) as ListValueRow[]

  const typedValueOf = (row: ListValueRow) =>
    row.value_type ? row[`value_${row.value_type}`] : undefined
  const selectedRow = rows.find(
    (row) => String(typedValueOf(row)) === String(rowValue),
  )

  // per-row handler: reading the value off the click event's target is
  // unreliable (Fluent Radio can fire it on the wrapping label, not the input)
  const selectRow = (row: ListValueRow) => {
    if (!row.value_type) return
    // clicking the selected value deselects it
    const deselect = selectedRow?.list_value_id === row.list_value_id
    const value = (deselect ? null : typedValueOf(row)) as string | null
    // deliver the value via a plain target event: getValueFromChange's radio
    // case parseFloats numeric-looking strings and would corrupt text values
    onChangePassed(
      { target: { name, value } } as unknown as React.ChangeEvent<
        HTMLInputElement
      >,
      { value },
    )
  }

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
    >
      <div className={styles.row}>
        <RadioGroup
          layout="vertical"
          name={name}
          // always a string: undefined would flip the inputs between
          // controlled and uncontrolled when selecting/deselecting
          value={selectedRow?.list_value_id ?? ''}
          autoFocus={autoFocus}
          ref={ref as unknown as React.Ref<HTMLDivElement>}
        >
          {res === undefined ? (
            <Loading />
          ) : (
            <>
              {rows.map((row) => (
                <Radio
                  key={row.list_value_id}
                  label={row.label ?? row.list_value_id}
                  value={row.list_value_id}
                  onClick={() => selectRow(row)}
                />
              ))}
            </>
          )}
        </RadioGroup>
        {!!button && button}
      </div>
    </Field>
  )
}
