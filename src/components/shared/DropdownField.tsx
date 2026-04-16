import * as fluentUiReactComponents from '@fluentui/react-components'
const { Dropdown, Field, Option } = fluentUiReactComponents
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import styles from './DropdownField.module.css'

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
}) => {
  const { formatMessage } = useIntl()
  const res = useLiveQuery(
    `SELECT * FROM ${table}${
      where ? ` WHERE ${where}` : ''
    } order by ${orderBy}`,
  )
  const rows = res?.rows ?? []
  const options = rows.map((o) => ({
    text: o[labelField],
    value: o[idField ?? name],
  }))
  const selectedOptions = options.filter(({ value: v }) => v === value)

  const validationState = validationStateIn
    ? validationStateIn
    : !options?.length //&& !!value
      ? 'warning'
      : 'none'

  const validationMessage = validationMessageIn
    ? validationMessageIn
    : !options?.length //&& !!value
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
          selectedOptions={selectedOptions}
          onOptionSelect={(e, data) =>
            onChange({ target: { name, value: data.optionValue } })
          }
          appearance="underline"
          autoFocus={autoFocus}
          disabled={disabled}
          ref={ref}
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
