import * as fluentUiReactComponents from '@fluentui/react-components'
const { Dropdown, Field, Option } = fluentUiReactComponents
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import styles from './DropdownField.module.css'
import type { FieldChangeData } from './fieldChange.ts'

type Props = {
  name: string
  label?: string
  labelField?: string
  table: string
  idField?: string
  where?: string
  orderBy?: string
  value?: unknown
  onChange: (
    ev: React.ChangeEvent<HTMLInputElement>,
    data?: FieldChangeData,
  ) => void
  autoFocus?: boolean
  disabled?: boolean
  validationMessage?: string
  validationState?: 'error' | 'warning' | 'success' | 'none'
  button?: React.ReactNode
  noDataMessage?: string
  hideWhenNoData?: boolean
  ref?: React.Ref<HTMLInputElement>
}

export const DropdownField = ({
  name,
  label,
  labelField = 'label',
  table,
  idField, // defaults to name, used for cases where the id field is not the same as the name field (?)
  where,
  orderBy = 'label asc',
  value,
  onChange,
  autoFocus,
  disabled = false,
  validationMessage: validationMessageIn,
  validationState: validationStateIn = 'none',
  button,
  noDataMessage = undefined,
  hideWhenNoData = false,
  ref,
}: Props) => {
  const { formatMessage } = useIntl()
  // consumers pass Fluent's (ev, data) change handlers; called here with fake events
  const onChangeFake = onChange as unknown as (e: {
    target: { name?: string; value?: string }
  }) => void
  const res = useLiveQuery<{ value: string; text: string }>(
    `SELECT ${idField ?? name} AS value, ${labelField} AS text FROM ${table}${
      where ? ` WHERE ${where}` : ''
    } order by ${orderBy}`,
  )
  const options = res?.rows ?? []
  const selectedOptions = options.filter(({ value: v }) => v === value)

  const validationState = validationStateIn
    ? validationStateIn
    : res && !options.length
      ? 'warning'
      : 'none'

  const validationMessage = validationMessageIn
    ? validationMessageIn
    : res && !options.length
      ? formatMessage(
          {
            id: 'bCOpQr',
            defaultMessage:
              'Keine {table}-Einträge vorhanden. Bitte zuerst einen hinzufügen.',
          },
          { table },
        )
      : undefined

  if (hideWhenNoData && !options?.length) return null

  return (
    <Field
      label={label ?? '(no label provided)'}
      validationMessage={validationMessage}
      validationState={validationState}
    >
      <div className={styles.row}>
        <Dropdown
          name={name}
          value={selectedOptions?.[0]?.text ?? ''}
          selectedOptions={selectedOptions as unknown as string[]}
          onOptionSelect={(_e: unknown, data: { optionValue?: string }) =>
            onChangeFake({ target: { name, value: data.optionValue } })
          }
          appearance="underline"
          autoFocus={autoFocus}
          disabled={disabled}
          ref={ref as unknown as React.Ref<HTMLButtonElement>}
          className={styles.dd}
          clearable
        >
          {options.length ? (
            options.map((params) => {
              const { text, value } = params

              return (
                <Option key={value} value={value}>
                  {text}
                </Option>
              )
            })
          ) : (
            <Option value={''}>
              {noDataMessage ??
                formatMessage({
                  id: 'bCNoPq',
                  defaultMessage: 'Keine Daten gefunden',
                })}
            </Option>
          )}
        </Dropdown>
        {!!button && button}
      </div>
    </Field>
  )
}
