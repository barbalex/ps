import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Dropdown, Field, Option } = fluentUiReactComponents

import { TextField } from '../../components/shared/TextField.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { SectionDescription } from '../../components/shared/SectionDescription.tsx'
import type FieldGroups from '../../models/public/FieldGroups.ts'

import '../../form.css'

// this form is rendered from a parent or outlet
export const FieldGroupForm = ({
  onChange,
  row,
  autoFocusRef,
  validations = {},
}: {
  onChange: (e: React.ChangeEvent<HTMLElement>, data?: unknown) => void
  row: FieldGroups
  autoFocusRef?: React.Ref<HTMLInputElement>
  validations?: Record<string, { state: 'error'; message: string }>
}) => {
  const { formatMessage } = useIntl()

  return (
    <>
      <Section title={formatMessage({ id: '7bQ1wE', defaultMessage: 'Namen' })}>
        <TextField
          label={formatMessage({
            id: 'bQ5eF1',
            defaultMessage: 'Name',
          })}
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
          validationState={validations?.name?.state}
          validationMessage={validations?.name?.message}
        />
      </Section>
      <Section
        title={formatMessage({ id: 'cR7tE2', defaultMessage: 'Felder' })}
      >
        <SectionDescription>
          {formatMessage({
            id: 'dS9uI3',
            defaultMessage:
              'Felder dieser Tabelle für die Gruppe auswählen. Eine Ansicht mit dieser Feldergruppe zeigt nur diese Felder. Die Reihenfolge innerhalb des Formulars bleibt die übliche.',
          })}
        </SectionDescription>
        <FieldsEditor row={row} onChange={onChange} />
      </Section>
    </>
  )
}

/**
 * Multiselect of the table's fields (in form order = field_sorts order).
 * The selected field_ids are stored in field_sorts order, so the group
 * renders fields in the usual form order.
 */
const FieldsEditor = ({
  row,
  onChange,
}: {
  row: FieldGroups
  onChange: (e: React.ChangeEvent<HTMLElement>, data?: unknown) => void
}) => {
  const { formatMessage } = useIntl()
  const projectId = row.project_id as string | null
  const tableName = (row.table_name ?? 'checks') as string

  // fields in form order: same ordering as the Jsonb form renderer uses
  const resFields = useLiveQuery(
    `SELECT
      fields.field_id,
      fields.name,
      fields.field_label
    FROM fields
    LEFT JOIN unnest(
        ARRAY(SELECT sorted_field_ids FROM field_sorts WHERE table_name = fields.table_name and project_id = fields.project_id)
      ) WITH ORDINALITY t(field_id, ord) USING (field_id)
    WHERE
      fields.table_name = $1
      and fields.project_id = $2
    ORDER BY t.ord`,
    [tableName, projectId],
  )
  const fields = (resFields?.rows ?? []) as {
    field_id: string
    name: string
    field_label: string | null
  }[]

  const selectedIds = row.sorted_field_ids ?? []

  const setSelectedIds = (ids: string[]) => {
    onChange(
      { target: { name: 'sorted_field_ids', type: 'change' } } as never,
      {
        value: ids,
      },
    )
  }

  const onOptionSelect = (_e: unknown, data: { optionValue?: string }) => {
    const id = data.optionValue ?? ''
    const isSelected = selectedIds.includes(id)
    const selected = new Set(selectedIds)
    if (isSelected) {
      selected.delete(id)
    } else {
      selected.add(id)
    }
    // store in form order
    const ids = fields
      .filter((f) => selected.has(f.field_id))
      .map((f) => f.field_id)
    setSelectedIds(ids)
  }

  return (
    <Field
      label={formatMessage({
        id: 'eT1iO4',
        defaultMessage: 'Felder der Gruppe',
      })}
    >
      <Dropdown
        multiselect
        selectedOptions={selectedIds}
        onOptionSelect={onOptionSelect}
        placeholder={formatMessage({
          id: 'fU9oP5',
          defaultMessage: 'Felder auswählen…',
        })}
      >
        {fields.map((f) => (
          <Option
            key={f.field_id}
            value={f.field_id}
            text={f.field_label ?? f.name}
          >
            {f.field_label ?? f.name}
          </Option>
        ))}
      </Dropdown>
    </Field>
  )
}
