import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Dropdown, Field, Option, Input } = fluentUiReactComponents

import { TextField } from '../../components/shared/TextField.tsx'
import { Section } from '../../components/shared/Section.tsx'
import type FilteredViews from '../../models/public/FilteredViews.ts'
import type { TableRowFilter } from '../../store.ts'

import '../../form.css'

// this form is rendered from a parent or outlet
export const FilteredViewForm = ({
  onChange,
  row,
  autoFocusRef,
  validations = {},
}: {
  onChange: (e: React.ChangeEvent<HTMLElement>, data?: unknown) => void
  row: FilteredViews
  autoFocusRef?: React.Ref<HTMLInputElement>
  validations?: Record<string, { state: 'error'; message: string }>
}) => {
  const { formatMessage } = useIntl()

  return (
    <>
      <Section title={formatMessage({ id: '7bQ1wE', defaultMessage: 'Namen' })}>
        <TextField
          label={formatMessage({
            id: 'Wq3zX1',
            defaultMessage: 'Name Singular (Deutsch)',
          })}
          name="name_singular_de"
          value={row.name_singular_de ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
          validationState={validations?.name_singular_de?.state}
          validationMessage={validations?.name_singular_de?.message}
        />
        <TextField
          label={formatMessage({
            id: 'Wq3zX2',
            defaultMessage: 'Name Plural (Deutsch)',
          })}
          name="name_plural_de"
          value={row.name_plural_de ?? ''}
          onChange={onChange}
          validationState={validations?.name_plural_de?.state}
          validationMessage={validations?.name_plural_de?.message}
        />
        <TextField
          label={formatMessage({
            id: 'Wq3zX3',
            defaultMessage: 'Name Singular (Englisch)',
          })}
          name="name_singular_en"
          value={row.name_singular_en ?? ''}
          onChange={onChange}
          validationState={validations?.name_singular_en?.state}
          validationMessage={validations?.name_singular_en?.message}
        />
        <TextField
          label={formatMessage({
            id: 'Wq3zX4',
            defaultMessage: 'Name Plural (Englisch)',
          })}
          name="name_plural_en"
          value={row.name_plural_en ?? ''}
          onChange={onChange}
          validationState={validations?.name_plural_en?.state}
          validationMessage={validations?.name_plural_en?.message}
        />
        <TextField
          label={formatMessage({
            id: 'Wq3zX5',
            defaultMessage: 'Name Singular (Französisch)',
          })}
          name="name_singular_fr"
          value={row.name_singular_fr ?? ''}
          onChange={onChange}
          validationState={validations?.name_singular_fr?.state}
          validationMessage={validations?.name_singular_fr?.message}
        />
        <TextField
          label={formatMessage({
            id: 'Wq3zX6',
            defaultMessage: 'Name Plural (Französisch)',
          })}
          name="name_plural_fr"
          value={row.name_plural_fr ?? ''}
          onChange={onChange}
          validationState={validations?.name_plural_fr?.state}
          validationMessage={validations?.name_plural_fr?.message}
        />
        <TextField
          label={formatMessage({
            id: 'Wq3zX7',
            defaultMessage: 'Name Singular (Italienisch)',
          })}
          name="name_singular_it"
          value={row.name_singular_it ?? ''}
          onChange={onChange}
          validationState={validations?.name_singular_it?.state}
          validationMessage={validations?.name_singular_it?.message}
        />
        <TextField
          label={formatMessage({
            id: 'Wq3zX8',
            defaultMessage: 'Name Plural (Italienisch)',
          })}
          name="name_plural_it"
          value={row.name_plural_it ?? ''}
          onChange={onChange}
          validationState={validations?.name_plural_it?.state}
          validationMessage={validations?.name_plural_it?.message}
        />
      </Section>
      <Section
        title={formatMessage({ id: '8cR2wF', defaultMessage: 'Filter' })}
      >
        <FilterEditor row={row} onChange={onChange} />
        <LabelByEditor row={row} onChange={onChange} />
        <TextField
          label={formatMessage({ id: 'Pq7nWk', defaultMessage: 'Sortierwert' })}
          name="sort"
          type="number"
          value={row.sort ?? ''}
          onChange={onChange}
          validationState={validations?.sort?.state}
          validationMessage={
            validations?.sort?.message ??
            formatMessage({
              id: '9dS3wG',
              defaultMessage:
                'Reihenfolge der gefilterten Ansichten in der Navigation. Tieferer Wert erscheint weiter oben.',
            })
          }
        />
      </Section>
    </>
  )
}

/**
 * Edits the first condition of the view's filter:
 * one data field (from the fields table for the view's table) and its value.
 * Stored as [{ "data.<name>": { "$eq": "<value>" } }] — the same format as
 * user table row filters.
 */
const FilterEditor = ({
  row,
  onChange,
}: {
  row: FilteredViews
  onChange: (e: React.ChangeEvent<HTMLElement>, data?: unknown) => void
}) => {
  const { formatMessage } = useIntl()
  const projectId = row.project_id as string | null
  const tableName = (row.table_name ?? 'checks') as string

  const resFields = useLiveQuery(
    `SELECT name, field_label, list_id FROM fields WHERE project_id = $1 AND table_name = $2 ORDER BY field_label`,
    [projectId, tableName],
  )
  const fields = (resFields?.rows ?? []) as {
    name: string
    field_label: string | null
    list_id: string | null
  }[]

  // current filter -> field name, operator and value
  const { fieldName, operator, value } = useMemo(() => {
    const filter = (row.filter ?? []) as TableRowFilter[]
    const firstOrCondition = filter[0] ?? {}
    const entry = Object.entries(firstOrCondition)[0]
    if (!entry) return { fieldName: '', operator: '$eq', value: '' }
    const [key, wrappedValue] = entry
    const isOperatorObject =
      wrappedValue !== null &&
      typeof wrappedValue === 'object' &&
      !Array.isArray(wrappedValue)
    const rawOperator =
      isOperatorObject && '$ne' in wrappedValue ? '$ne' : '$eq'
    const rawValue = isOperatorObject
      ? (wrappedValue as Record<string, unknown>)[rawOperator]
      : wrappedValue
    return {
      fieldName: key.startsWith('data.') ? key.substring(5) : key,
      operator: rawOperator,
      value: rawValue == null ? '' : String(rawValue),
    }
  }, [row.filter])

  const selectedField = fields.find((f) => f.name === fieldName)

  const resListValues = useLiveQuery(
    selectedField?.list_id
      ? `SELECT value_text FROM list_values WHERE list_id = $1 ORDER BY value_text`
      : `SELECT 1 WHERE false`,
    selectedField?.list_id ? [selectedField.list_id] : [],
  )
  const listValues = (resListValues?.rows ?? []) as {
    value_text: string | null
  }[]

  const setFilter = (
    newFieldName: string,
    newValue: string,
    newOperator: string = operator,
  ) => {
    const newFilter: TableRowFilter[] = newFieldName
      ? [{ [`data.${newFieldName}`]: { [newOperator]: newValue } }]
      : []
    onChange({ target: { name: 'filter', type: 'change' } } as never, {
      value: newFilter,
    })
  }

  return (
    <>
      <Field
        label={formatMessage({
          id: '4eT5wH',
          defaultMessage: 'Feld',
        })}
      >
        <Dropdown
          value={fieldName}
          onOptionSelect={(_e, data) => {
            const newFieldName = (data.optionValue ?? '') as string
            // keep the value when the field stays the same
            setFilter(newFieldName, newFieldName === fieldName ? value : '')
          }}
          selectedOptions={fieldName ? [fieldName] : []}
        >
          {fields.map((f) => (
            <Option key={f.name} value={f.name} text={f.field_label ?? f.name}>
              {f.field_label ?? f.name}
            </Option>
          ))}
        </Dropdown>
      </Field>
      <Field
        label={formatMessage({
          id: '7hW8wJ',
          defaultMessage: 'Operator',
        })}
      >
        <Dropdown
          value={
            operator === '$ne'
              ? formatMessage({ id: '8iX9wK', defaultMessage: 'ist nicht' })
              : formatMessage({ id: '9jY0wL', defaultMessage: 'ist' })
          }
          onOptionSelect={(_e, data) => {
            setFilter(fieldName, value, (data.optionValue ?? '$eq') as string)
          }}
          selectedOptions={[operator]}
          disabled={!fieldName}
        >
          <Option value="$eq" text="ist">
            {formatMessage({ id: '9jY0wL', defaultMessage: 'ist' })}
          </Option>
          <Option value="$ne" text="ist nicht">
            {formatMessage({ id: '8iX9wK', defaultMessage: 'ist nicht' })}
          </Option>
        </Dropdown>
      </Field>
      {selectedField?.list_id ? (
        <Field
          label={formatMessage({
            id: '5fU6wI',
            defaultMessage: 'Wert',
          })}
        >
          <Dropdown
            value={value}
            onOptionSelect={(_e, data) => {
              setFilter(fieldName, (data.optionValue ?? '') as string)
            }}
            selectedOptions={value ? [value] : []}
          >
            {listValues.map((lv, i) => (
              <Option
                key={i}
                value={lv.value_text ?? ''}
                text={lv.value_text ?? ''}
              >
                {lv.value_text}
              </Option>
            ))}
          </Dropdown>
        </Field>
      ) : (
        <Field
          label={formatMessage({
            id: '5fU6wI',
            defaultMessage: 'Wert',
          })}
        >
          <Input
            value={value}
            onChange={(e) => setFilter(fieldName, e.target.value)}
            disabled={!fieldName}
          />
        </Field>
      )}
    </>
  )
}

/**
 * Chooses the data field appended to the year when labeling the rows of the
 * view (apf2 manner: "2019: Kontrolle"). None = year only.
 */
const LabelByEditor = ({
  row,
  onChange,
}: {
  row: FilteredViews
  onChange: (e: React.ChangeEvent<HTMLElement>, data?: unknown) => void
}) => {
  const { formatMessage } = useIntl()
  const projectId = row.project_id as string | null
  const tableName = (row.table_name ?? 'checks') as string

  const resFields = useLiveQuery(
    `SELECT name, field_label FROM fields WHERE project_id = $1 AND table_name = $2 ORDER BY field_label`,
    [projectId, tableName],
  )
  const fields = (resFields?.rows ?? []) as {
    name: string
    field_label: string | null
  }[]

  const labelBy = (row.label_by ?? []) as string[]
  const selectedField = labelBy[0] ?? ''

  const setLabelBy = (fieldName: string) => {
    onChange({ target: { name: 'label_by', type: 'change' } } as never, {
      value: fieldName ? [fieldName] : null,
    })
  }

  return (
    <Field
      label={formatMessage({
        id: '0kZ1wM',
        defaultMessage: 'Zeilen beschriften mit (zusätzlich zum Jahr)',
      })}
    >
      <Dropdown
        value={
          selectedField
            ? (fields.find((f) => f.name === selectedField)?.field_label ??
              selectedField)
            : formatMessage({ id: '1lA2wN', defaultMessage: 'nur Jahr' })
        }
        onOptionSelect={(_e, data) => {
          setLabelBy((data.optionValue ?? '') as string)
        }}
        selectedOptions={selectedField ? [selectedField] : []}
      >
        <Option
          value=""
          text={formatMessage({ id: '1lA2wN', defaultMessage: 'nur Jahr' })}
        >
          {formatMessage({ id: '1lA2wN', defaultMessage: 'nur Jahr' })}
        </Option>
        {fields.map((f) => (
          <Option key={f.name} value={f.name} text={f.field_label ?? f.name}>
            {f.field_label ?? f.name}
          </Option>
        ))}
      </Dropdown>
    </Field>
  )
}
