import { useIntl } from 'react-intl'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

/**
 * Renders a dropdown of the selectable fields for the chosen chart-subject
 * table. Each entry uses the same label that the field's input has in its
 * dedicated form component, so users see familiar names.
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
const fieldsByTable: Record<string, Record<string, string>> = {
  subprojects: {
    name: 'Name',
    start_year: 'Start year',
  },
  places: {
    level: 'Level',
    parent_id: 'Parent Place',
    since: 'Since when does this place exist? (year)',
    until: 'Until when did this place exist? (year)',
  },
  checks: {
    date: 'Date',
    relevant_for_reports: 'Relevant for reports',
  },
  check_values: {
    unit_id: 'Unit',
    value_integer: 'Value (integer)',
    value_numeric: 'Value (numeric)',
    value_text: 'Value (text)',
  },
  actions: {
    date: 'Date',
    relevant_for_reports: 'Relevant for reports',
  },
  action_values: {
    unit_id: 'Unit',
    value_integer: 'Value (integer)',
    value_numeric: 'Value (numeric)',
    value_text: 'Value (text)',
  },
}

export const Field = ({ onChange, row, validations }) => {
  const { formatMessage } = useIntl()

  const fields = row.table_name ? (fieldsByTable[row.table_name] ?? {}) : {}
  const list = Object.keys(fields)

  // Nothing to show if the table has no recognised fields or none is selected
  if (!list.length) return null

  return (
    <RadioGroupField
      label={formatMessage({ id: 'bDiLoM', defaultMessage: 'Feld' })}
      name="field"
      list={list}
      value={row.field ?? ''}
      onChange={onChange}
      labelMap={fields}
      validationState={validations?.field?.state}
      validationMessage={validations?.field?.message}
    />
  )
}
