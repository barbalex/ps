import { useEffect, useState } from 'react'
import { Checkbox, Combobox, Field, Option } from '@fluentui/react-components'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import {
  isCodeArray,
  selectionFilter,
  type ListCode,
  type MatchMode,
} from '../../modules/multiselect.ts'
import styles from './MultiSelectFromList.module.css'

type Props = {
  label: string
  listId: string | null
  fieldType: string | null
  searchable: boolean
  value: unknown
  onChange: (codes: ListCode[], mode: MatchMode) => void | Promise<void>
  filter?: boolean
  preview?: boolean
  print?: boolean
  autoFocus?: boolean
  button?: React.ReactNode
  validationMessage?: string
}

export function MultiSelectFromList({
  label,
  listId,
  fieldType,
  searchable,
  value,
  onChange,
  filter,
  preview,
  print,
  autoFocus,
  button,
  validationMessage,
}: Props) {
  const { formatMessage } = useIntl()
  const res = useLiveQuery<{
    code: ListCode
    label: string
    obsolete: boolean
  }>(
    `SELECT DISTINCT ON (code) to_jsonb(v)->('value_' || l.value_type) AS code, v.label, v.obsolete
     FROM list_values v JOIN lists l USING(list_id)
     WHERE l.list_id=$1 AND l.value_type::text=$2 AND to_jsonb(v)->>('value_' || l.value_type) IS NOT NULL
     ORDER BY code, v.obsolete, v.list_value_id`,
    [listId || null, fieldType === 'decimal' ? 'numeric' : fieldType],
  )
  const rule = filter ? selectionFilter(value) : undefined
  const [pending, setPending] = useState<ListCode[] | null>(null)
  const stored = rule?.codes ?? (isCodeArray(value) ? value : [])
  const storedKey = JSON.stringify(stored)
  // The write resolves before the live query necessarily reflects it. Keep
  // rapid toggles cumulative until the newest selection is acknowledged.
  useEffect(() => {
    if (
      !preview &&
      (JSON.stringify(pending) === storedKey || validationMessage)
    )
      setPending(null)
  }, [pending, storedKey, preview, validationMessage])
  const selected = pending ?? stored
  const [emptyMode, setEmptyMode] = useState<MatchMode>('$any')
  const mode = rule?.mode ?? emptyMode
  const [query, setQuery] = useState<string | null>(null)
  const choices = new Map<ListCode, string>()
  for (const row of res?.rows ?? []) {
    if (!row.obsolete || selected.includes(row.code))
      choices.set(row.code, row.label)
  }
  // Keep removed list entries visible and removable, but never offer them as new choices.
  for (const code of selected)
    if (!choices.has(code)) choices.set(code, String(code))
  const toggle = (code: ListCode) => {
    const next =
      selected.includes(code) ?
        selected.filter((v) => v !== code)
      : [...selected, code]
    setPending(next)
    if (!preview) onChange(next, mode)
  }
  const selectedText = selected.map((code) => choices.get(code)).join(', ')
  const visible = [...choices].filter(([, text]) =>
    text.toLocaleLowerCase().includes(query?.trim().toLocaleLowerCase() ?? ''),
  )
  const unavailable = !listId || (res && !res.rows.some((row) => !row.obsolete))
  const message =
    validationMessage ??
    (unavailable ?
      formatMessage({
        id: 'multiListNeeded',
        defaultMessage: 'Eine passende Liste mit aktiven Werten wird benötigt.',
      })
    : undefined)
  return (
    <fieldset className={styles.field}>
      <legend>{label}</legend>
      {print ?
        <span>{selectedText}</span>
      : <>
          {filter && (
            <Checkbox
              label={formatMessage({
                id: 'multiMatchAll',
                defaultMessage: 'Alle ausgewählten Werte müssen vorkommen',
              })}
              checked={mode === '$all'}
              onChange={(_, d) => {
                const next = d.checked ? '$all' : '$any'
                setEmptyMode(next)
                if (selected.length) onChange(selected, next)
              }}
            />
          )}
          <div className={styles.row}>
            {searchable ?
              <Combobox
                inlinePopup
                multiselect
                freeform={false}
                aria-label={label}
                selectedOptions={selected.map((code) => JSON.stringify(code))}
                value={query ?? selectedText}
                autoFocus={autoFocus}
                onOpenChange={(_, { open }) => setQuery(open ? '' : null)}
                onChange={(e) => setQuery(e.target.value)}
                onOptionSelect={(_, d) => {
                  const code = [...choices.keys()].find(
                    (v) => JSON.stringify(v) === d.optionValue,
                  )
                  if (code !== undefined) toggle(code)
                  setQuery('')
                }}
              >
                {visible.map(([code, text]) => (
                  <Option
                    key={JSON.stringify(code)}
                    value={JSON.stringify(code)}
                    text={text}
                  >
                    {text}
                  </Option>
                ))}
                {!visible.length && (
                  <Option disabled>
                    {formatMessage({
                      id: 'mapCreateParentNone',
                      defaultMessage: 'Keine Treffer',
                    })}
                  </Option>
                )}
              </Combobox>
            : <div className={styles.checks}>
                {[...choices].map(([code, text], i) => (
                  <Checkbox
                    key={JSON.stringify(code)}
                    label={text}
                    autoFocus={autoFocus && i === 0}
                    checked={selected.includes(code)}
                    onChange={() => toggle(code)}
                  />
                ))}
              </div>
            }
            {button}
          </div>
          {searchable && query !== null && <span>{selectedText}</span>}
        </>
      }
      {message && (
        <Field
          validationMessage={message}
          validationState={validationMessage ? 'error' : 'warning'}
        />
      )}
    </fieldset>
  )
}
