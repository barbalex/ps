import { useState } from 'react'
import { useIntl } from 'react-intl'
import { Combobox, Field, Option } from '@fluentui/react-components'
import { useLiveQuery } from '@electric-sql/pglite-react'

import styles from './DropdownFieldFromList.module.css'

interface Props {
  name: string
  label?: string
  list_id: string
  value: unknown
  onChange: (value: unknown) => void
  preview?: boolean
  print?: boolean
  autoFocus?: boolean
  ref?: React.Ref<HTMLInputElement>
  validationMessage?: string
  validationState?: 'error' | 'warning' | 'success' | 'none'
  button?: React.ReactNode
}

export const DropdownFieldFromList = ({
  name,
  label,
  list_id,
  value,
  onChange,
  preview,
  print,
  autoFocus,
  ref,
  validationMessage,
  validationState,
  button,
}: Props) => {
  const { formatMessage } = useIntl()
  const [query, setQuery] = useState<string | null>(null)
  const [previewValue, setPreviewValue] = useState<unknown>(value)
  const current = preview ? previewValue : value
  const res = useLiveQuery<
    {
      list_value_id: string
      label: string
      value_type: string
      obsolete: boolean
    } & Record<string, unknown>
  >(
    `SELECT lv.list_value_id, lv.label, lv.obsolete, l.value_type,
      lv.value_integer, lv.value_numeric, lv.value_text, lv.value_date, lv.value_datetime
     FROM list_values lv
     JOIN lists l ON l.list_id = lv.list_id
     WHERE lv.list_id = $1
     ORDER BY lv.obsolete, lv.label, lv.list_value_id`,
    [list_id],
  )
  const rows = (res?.rows ?? [])
    .map((row) => {
      const raw = row[`value_${row.value_type}`]
      return { ...row, code: raw instanceof Date ? raw.toISOString() : raw }
    })
    .filter((row) => row.code != null)
  const selectedRow = rows.find((row) => String(row.code) === String(current))
  const selectedText = selectedRow?.label ?? String(current ?? '')
  const needle = query?.trim().toLocaleLowerCase() ?? ''
  const matches = rows.filter(
    (row) =>
      (!row.obsolete || row === selectedRow) &&
      (row.label.toLocaleLowerCase().includes(needle) ||
        String(row.code).toLocaleLowerCase().includes(needle)),
  )

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
      className={styles.field}
    >
      <div className={styles.row}>
        {print ?
          <span>{selectedText}</span>
        : <Combobox
            name={name}
            aria-label={label ?? name}
            value={query ?? selectedText}
            selectedOptions={
              selectedRow ? [selectedRow.list_value_id]
              : selectedText ?
                [selectedText]
              : []
            }
            onOpenChange={(_, { open }) =>
              setQuery((previous) => (open ? (previous ?? '') : null))
            }
            onBlur={() => setQuery(null)}
            onChange={(e) => setQuery(e.target.value)}
            onOptionSelect={(event, { optionValue }) => {
              // Fluent also emits a clear when typing stops matching the
              // selection. Only an explicit clear should change the record.
              if (!optionValue && event.type === 'change') return
              const next =
                rows.find((row) => row.list_value_id === optionValue)?.code ??
                null
              setQuery(null)
              if (preview) setPreviewValue(next)
              else onChange(next)
            }}
            appearance="underline"
            className={styles.dd}
            autoFocus={autoFocus}
            ref={ref}
            inlinePopup
            clearable
          >
            {matches.map((row) => (
              <Option
                key={row.list_value_id}
                value={row.list_value_id}
              >
                {row.label}
              </Option>
            ))}
            {!matches.length && (
              <Option disabled>
                {formatMessage({
                  id: 'mapCreateParentNone',
                  defaultMessage: 'Keine Treffer',
                })}
              </Option>
            )}
          </Combobox>
        }
        {!!button && button}
      </div>
    </Field>
  )
}
