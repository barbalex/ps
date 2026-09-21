import { useParams } from '@tanstack/react-router'
import { useIntl } from 'react-intl'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { languageAtom } from '../../store.ts'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import type ChartSubjects from '../../models/public/ChartSubjects.ts'

/**
 * Renders a radio-group of the selectable fields for the chosen chart-subject
 * table. Each entry uses the same label that the field's input has in its
 * dedicated form component, translated to the app language, so users see
 * familiar names.
 *
 * Which fields are offered depends on the calculation method:
 * - count_rows_by_distinct_field_values: the keys present in the table's
 *   `data` jsonb (e.g. the status of a place) — one series is built per value
 * - sum_values_of_field: the numeric quantity columns of the quantity tables
 * - otherwise: the table's regular columns
 */

// Message descriptors for all field labels, grouped by table.
// Reuses existing IDs where the same concept already has a translation.
const fieldMessages: Record<string, { id: string; defaultMessage: string }> = {
  // subprojects
  name: { id: 'XkV5yZ', defaultMessage: 'Name' },
  start_year: { id: 'bEkKpP', defaultMessage: 'Startjahr' },
  // places
  level: { id: 'bDeHkI', defaultMessage: 'Stufe' },
  parent_id: { id: 'bElLqQ', defaultMessage: 'Übergeordneter Ort' },
  since: {
    id: 'bEmMrR',
    defaultMessage: 'Seit welchem Jahr existiert die {nameSingular}?',
  },
  until: {
    id: 'bEnNsS',
    defaultMessage: 'Bis zu welchem Jahr existierte die {nameSingular}?',
  },
  // checks / actions
  date: { id: 'bEoOtT', defaultMessage: 'Datum' },
  relevant_for_reports: {
    id: 'bEpPuU',
    defaultMessage: 'Relevant für Berichte',
  },
  // check_quantities / check_taxa / action_quantities / action_taxa
  unit_id: { id: 'bDkNqO', defaultMessage: 'Einheit' },
  quantity_integer: { id: 'bEqQvV', defaultMessage: 'Wert (ganzzahlig)' },
  quantity_numeric: { id: 'bErRwW', defaultMessage: 'Wert (numerisch)' },
  quantity_text: { id: 'bEsSxX', defaultMessage: 'Wert (Text)' },
}

const fieldsByTable: Record<string, string[]> = {
  subprojects: ['name', 'start_year'],
  places: ['level', 'parent_id', 'since', 'until'],
  checks: ['date', 'relevant_for_reports'],
  check_quantities: ['unit_id', 'quantity_integer', 'quantity_numeric', 'quantity_text'],
  check_taxa: ['unit_id', 'quantity_integer', 'quantity_numeric', 'quantity_text'],
  actions: ['date', 'relevant_for_reports'],
  action_quantities: ['unit_id', 'quantity_integer', 'quantity_numeric', 'quantity_text'],
  action_taxa: ['unit_id', 'quantity_integer', 'quantity_numeric', 'quantity_text'],
}

// tables whose regular columns can serve as a sum source
const sumFields = ['quantity_integer', 'quantity_numeric']

const levelFilter = (tableLevel: string | null | undefined, alias: string) =>
  tableLevel === '1'
    ? `${alias}.parent_id IS NULL`
    : tableLevel === '2'
      ? `${alias}.parent_id IS NOT NULL`
      : 'TRUE'

type FieldProps = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>, data?: object) => void
  row: ChartSubjects
  validations: Record<
    string, { state?: 'error' | 'warning' | 'success' | 'none'; message?: string }
  >
}

/** offers the keys that exist in the table's data jsonb within the subproject */
const DataKeysField = ({ onChange, row, validations }: FieldProps) => {
  const { formatMessage } = useIntl()
  const { subprojectId } = useParams({ strict: false })

  const query =
    row.table_name === 'places' ?
      `SELECT DISTINCT k AS key
       FROM places t, jsonb_object_keys(t.data) k
       WHERE t.subproject_id = $1 AND ${levelFilter(row.table_level, 't')}
       ORDER BY 1`
    : `SELECT DISTINCT k AS key
       FROM ${row.table_name} t
         INNER JOIN places p ON t.place_id = p.place_id, jsonb_object_keys(t.data) k
       WHERE p.subproject_id = $1 AND ${levelFilter(row.table_level, 'p')}
       ORDER BY 1`

  const res = useLiveQuery(query, [subprojectId])
  const fields = (res?.rows?.map((r) => r.key) ?? []) as string[]

  if (!fields.length) return null

  return (
    <RadioGroupField
      label={formatMessage({
        id: 'bEyYzZ',
        defaultMessage: 'Feld, dessen Werte die Serien bilden',
      })}
      name="field"
      list={fields}
      value={row.field ?? ''}
      onChange={onChange}
      labelMap={Object.fromEntries(fields.map((key) => [key, key]))}
      validationState={validations?.field?.state}
      validationMessage={validations?.field?.message}
    />
  )
}

export const Field = ({ onChange, row, validations }: FieldProps) => {
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const params = useParams({ strict: false }) as Record<string, string | undefined>
  const projectId = params.projectId ?? params.projectId_

  const nameRes = useLiveQuery(
    `SELECT name_singular_${language} FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, Number(row?.table_level ?? 1)],
  )
  const nameSingular = (nameRes?.rows?.[0]?.[
    `name_singular_${language}`
  ] ?? 'Population') as string

  if (row?.calc_method === 'count_rows_by_distinct_field_values') {
    const isRowTable =
      row.table_name === 'places' ||
      row.table_name === 'checks' ||
      row.table_name === 'actions'
    // no data keys to group by on other tables
    return isRowTable ?
        <DataKeysField
          onChange={onChange}
          row={row}
          validations={validations}
        />
      : null
  }

  const fields =
    row?.calc_method === 'sum_values_of_field' ?
      sumFields
    : row.table_name ? (fieldsByTable[row.table_name] ?? [])
    : []

  // Nothing to show if the table has no recognized fields
  if (!fields.length) return null

  const labelMap = Object.fromEntries(
    fields.map((key) => [
      key,
      key in fieldMessages ?
        formatMessage(fieldMessages[key], { nameSingular })
      : key,
    ]),
  )

  return (
    <RadioGroupField
      label={formatMessage({ id: 'bDiLoM', defaultMessage: 'Feld' })}
      name="field"
      list={fields}
      value={row.field ?? ''}
      onChange={onChange}
      labelMap={labelMap}
      validationState={validations?.field?.state}
      validationMessage={validations?.field?.message}
    />
  )
}
