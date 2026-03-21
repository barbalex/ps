import { useParams } from '@tanstack/react-router'
import { useIntl } from 'react-intl'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { languageAtom } from '../../store.ts'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

/**
 * Renders a radio-group of the selectable fields for the chosen chart-subject
 * table. Each entry uses the same label that the field's input has in its
 * dedicated form component, translated to the app language, so users see
 * familiar names.
 *
 * Tables available: subprojects, places, checks, check_quantities, actions,
 * action_quantities (matching chart_subject_table_names seed data).
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
  // check_quantities / action_quantities
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
  actions: ['date', 'relevant_for_reports'],
  action_quantities: ['unit_id', 'quantity_integer', 'quantity_numeric', 'quantity_text'],
}

export const Field = ({ onChange, row, validations }) => {
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const { projectId } = useParams({ strict: false })

  const nameRes = useLiveQuery(
    `SELECT name_singular_${language} FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, Number(row?.table_level ?? 1)],
  )
  const nameSingular =
    nameRes?.rows?.[0]?.[`name_singular_${language}`] ?? 'Population'

  const fields = row.table_name ? (fieldsByTable[row.table_name] ?? []) : []

  // Nothing to show if the table has no recognized fields
  if (!fields.length) return null

  const labelMap = Object.fromEntries(
    fields.map((key) => [
      key,
      formatMessage(fieldMessages[key], { nameSingular }),
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
