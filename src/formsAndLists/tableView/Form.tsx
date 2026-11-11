import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Dropdown, Field, Option, Input } = fluentUiReactComponents

import { TextField } from '../../components/shared/TextField.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { SectionDescription } from '../../components/shared/SectionDescription.tsx'
import { tableViewTables, tableViewTableLabel, singleRowTableViewTables } from '../../modules/tableViewTables.ts'
import type TableViews from '../../models/public/TableViews.ts'
import type { TableRowFilter } from '../../store.ts'

import '../../form.css'

// this form is rendered from a parent or outlet
export const TableViewForm = ({
  onChange,
  row,
  autoFocusRef,
  validations = {},
}: {
  onChange: (e: React.ChangeEvent<HTMLElement>, data?: unknown) => void
  row: TableViews
  autoFocusRef?: React.Ref<HTMLInputElement>
  validations?: Record<string, { state: 'error'; message: string }>
}) => {
  const { formatMessage } = useIntl()
  // views on single-row tables (subprojects, projects) are forms on the
  // entity itself: row filter and row labels do not apply
  const isSingleRowTable = singleRowTableViewTables.has(
    (row.table_name ?? 'checks') as string,
  )

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
        title={formatMessage({
          id: '8cR2wF',
          defaultMessage: 'Zeilen und Spalten',
        })}
      >
        <SectionDescription>
          {formatMessage(
            isSingleRowTable
              ? {
                  id: 'kW2xR6',
                  defaultMessage:
                    'Optional: eine Feldergruppe wählen (nur diese Spalten zeigen). Leer = alle Spalten.',
                }
              : {
                  id: 'xG8wQ2',
                  defaultMessage:
                    'Optional: einen Zeilen-Filter setzen (nur Zeilen, die ihm entsprechen) und/oder eine Feldergruppe wählen (nur diese Spalten zeigen). Beides leer = alle Zeilen und Spalten.',
                },
          )}
        </SectionDescription>
        <Field
          label={formatMessage({
            id: 'hJ9sD2',
            defaultMessage: 'Tabelle',
          })}
        >
          <Dropdown
            value={tableViewTableLabel((row.table_name ?? 'checks') as string, formatMessage)}
            selectedOptions={[(row.table_name ?? 'checks') as string]}
            disabled
          >
            {tableViewTables.map(({ tableName, label }) => (
              <Option key={tableName} value={tableName} text={formatMessage(label)}>
                {formatMessage(label)}
              </Option>
            ))}
          </Dropdown>
        </Field>
        {!isSingleRowTable && <FilterEditor row={row} onChange={onChange} />}
        <FieldGroupEditor row={row} onChange={onChange} />
        {!isSingleRowTable && (
          <LabelByEditor row={row} onChange={onChange} />
        )}
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
                'Reihenfolge der Ansichten in der Navigation. Tieferer Wert erscheint weiter oben.',
            })
          }
        />
      </Section>
    </>
  )
}

/**
 * Chooses the optional field group of the view: the view then shows only
 * the group's columns (Feldergruppen are managed in the project
 * configuration). None = all columns.
 */
const FieldGroupEditor = ({
  row,
  onChange,
}: {
  row: TableViews
  onChange: (e: React.ChangeEvent<HTMLElement>, data?: unknown) => void
}) => {
  const { formatMessage } = useIntl()
  const projectId = row.project_id as string | null
  const tableName = (row.table_name ?? 'checks') as string

  const resFieldGroups = useLiveQuery(
    `SELECT field_group_id, label FROM field_groups WHERE project_id = $1 AND table_name = $2 ORDER BY label`,
    [projectId, tableName],
  )
  const fieldGroups = (resFieldGroups?.rows ?? []) as {
    field_group_id: string
    label: string | null
  }[]

  const selectedGroupId = row.field_group_id ?? ''
  const selectedGroup = fieldGroups.find(
    (g) => g.field_group_id === selectedGroupId,
  )

  const setFieldGroupId = (fieldGroupId: string) => {
    onChange({ target: { name: 'field_group_id', type: 'change' } } as never, {
      value: fieldGroupId || null,
    })
  }

  return (
    <Field
      label={formatMessage({
        id: 'wF4gR8',
        defaultMessage: 'Feldergruppe (Spalten)',
      })}
    >
      <Dropdown
        value={
          selectedGroup
            ? (selectedGroup.label ?? selectedGroup.field_group_id)
            : formatMessage({ id: 'yH6fT3', defaultMessage: 'alle Felder' })
        }
        onOptionSelect={(_e, data) => {
          setFieldGroupId((data.optionValue ?? '') as string)
        }}
        selectedOptions={selectedGroupId ? [selectedGroupId] : []}
      >
        <Option value="" text={formatMessage({ id: 'yH6fT3', defaultMessage: 'alle Felder' })}>
          {formatMessage({ id: 'yH6fT3', defaultMessage: 'alle Felder' })}
        </Option>
        {fieldGroups.map((g) => (
          <Option
            key={g.field_group_id}
            value={g.field_group_id}
            text={g.label ?? g.field_group_id}
          >
            {g.label ?? g.field_group_id}
          </Option>
        ))}
      </Dropdown>
    </Field>
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
  row: TableViews
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
  row: TableViews
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
