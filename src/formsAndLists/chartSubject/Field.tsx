import { useIntl } from 'react-intl'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

/**
 * Renders a radio-group of the selectable fields for the chosen chart-subject
 * table. Each entry uses the same label that the field's input has in its
 * dedicated form component, translated to the app language, so users see
 * familiar names.
 *
 * Tables available: subprojects, places, checks, check_values, actions,
 * action_values (matching chart_subject_table_names seed data).
 *
 * Excluded fields per table (never useful as a chart aggregation key):
 *   - the table's primary key (…_id)
 *   - account_id
 *   - geometry, bbox
 *   - label            (generated/computed column)
 *   - created_at, updated_at, updated_by
 *   - implicit parent FK columns (e.g. place_id, action_id, subproject_id,
 *     project_id) that only identify the parent row and are not displayed
 *     as standalone inputs in the form
 *   - data             (jsonb blob – not a single aggregatable column)
 */

// Message descriptors for all field labels, grouped by table.
// Reuses existing IDs where the same concept already has a translation.
const fieldMessages = {
  // subprojects
  name: { id: 'XkV5yZ', defaultMessage: 'Name' },
  start_year: { id: 'bEkKpP', defaultMessage: 'Startjahr' },
  // places
  level: { id: 'bDeHkI', defaultMessage: 'Stufe' },
  parent_id: { id: 'bElLqQ', defaultMessage: 'Übergeordneter Ort' },
  since: {
    id: 'bEmMrR',
    defaultMessage: 'Seit wann existiert dieser Ort? (Jahr)',
  },
  until: {
    id: 'bEnNsS',
    defaultMessage: 'Bis wann existierte dieser Ort? (Jahr)',
  },
  // checks / actions
  date: { id: 'bEoOtT', defaultMessage: 'Datum' },
  relevant_for_reports: {
    id: 'bEpPuU',
    defaultMessage: 'Relevant für Berichte',
  },
  // check_values / action_values
  unit_id: { id: 'bDkNqO', defaultMessage: 'Einheit' },
  value_integer: { id: 'bEqQvV', defaultMessage: 'Wert (ganzzahlig)' },
  value_numeric: { id: 'bErRwW', defaultMessage: 'Wert (numerisch)' },
  value_text: { id: 'bEsSxX', defaultMessage: 'Wert (Text)' },
}

const fieldsByTable: Record<string, string[]> = {
  subprojects: ['name', 'start_year'],
  places: ['level', 'parent_id', 'since', 'until'],
  checks: ['date', 'relevant_for_reports'],
  check_values: ['unit_id', 'value_integer', 'value_numeric', 'value_text'],
  actions: ['date', 'relevant_for_reports'],
  action_values: ['unit_id', 'value_integer', 'value_numeric', 'value_text'],
}

export const Field = ({ onChange, row, validations }) => {
  const { formatMessage } = useIntl()

  const fields = row.table_name ? (fieldsByTable[row.table_name] ?? []) : []

  // Nothing to show if the table has no recognised fields
  if (!fields.length) return null

  const labelMap = Object.fromEntries(
    fields.map((key) => [key, formatMessage(fieldMessages[key])]),
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
