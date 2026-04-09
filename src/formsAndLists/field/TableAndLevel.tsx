import * as fluentUiReactComponents from '@fluentui/react-components'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { languageAtom } from '../../store.ts'

const { Dropdown, Field, Option } = fluentUiReactComponents

type Opt = { id: string; table_name: string; level: number | null }

const placeScopedTables = new Set([
  'places',
  'checks',
  'check_reports',
  'actions',
  'action_reports',
  'observations',
  'files',
])

// Options ordered hierarchically (subproject scope → place level 1 → place level 2)
// mirroring the nav tree order
const opts: Opt[] = [
  // ── Subproject scope (no place-level) ──────────────────────────
  { id: 'project_reports', table_name: 'project_reports', level: null },
  { id: 'lists', table_name: 'lists', level: null },
  { id: 'taxonomies', table_name: 'taxonomies', level: null },
  { id: 'subprojects', table_name: 'subprojects', level: null },
  { id: 'subproject_reports', table_name: 'subproject_reports', level: null },
  { id: 'goals', table_name: 'goals', level: null },
  { id: 'goal_reports', table_name: 'goal_reports', level: null },
  { id: 'taxa', table_name: 'taxa', level: null },
  // ── Place level 1 ─────────────────────────────────────────────
  { id: 'places_1', table_name: 'places', level: 1 },
  { id: 'checks_1', table_name: 'checks', level: 1 },
  { id: 'check_reports_1', table_name: 'check_reports', level: 1 },
  { id: 'actions_1', table_name: 'actions', level: 1 },
  { id: 'action_reports_1', table_name: 'action_reports', level: 1 },
  { id: 'observations_1', table_name: 'observations', level: 1 },
  { id: 'files_1', table_name: 'files', level: 1 },
  // ── Place level 2 ─────────────────────────────────────────────
  { id: 'places_2', table_name: 'places', level: 2 },
  { id: 'checks_2', table_name: 'checks', level: 2 },
  { id: 'check_reports_2', table_name: 'check_reports', level: 2 },
  { id: 'actions_2', table_name: 'actions', level: 2 },
  { id: 'action_reports_2', table_name: 'action_reports', level: 2 },
  { id: 'observations_2', table_name: 'observations', level: 2 },
  { id: 'files_2', table_name: 'files', level: 2 },
]

export const TableAndLevel = ({
  projectId,
  onChange,
  row,
  validations,
  autoFocusRef,
}) => {
  const { formatMessage } = useIntl()
  const tableLabel = formatMessage({ id: 'Tb8kLm', defaultMessage: 'Tabelle' })
  const [language] = useAtom(languageAtom)
  const isFirstRender = useIsFirstRender()

  // Always call hooks unconditionally; use WHERE false when not in project context
  const projectRes = useLiveQuery(
    `SELECT ${language === 'de' ? "NULLIF(subproject_name_plural, '')" : `NULLIF(subproject_name_plural_${language}, '')`} AS name_plural, type FROM projects WHERE $1::boolean AND project_id = $2`,
    [!!projectId, projectId ?? ''],
  )
  const placeLevelsRes = useLiveQuery(
    `SELECT level,
        NULLIF(name_singular_${language}, '') AS name_singular,
        NULLIF(name_plural_${language}, '') AS name_plural
    FROM place_levels WHERE $1::boolean AND project_id = $2 ORDER BY level`,
    [!!projectId, projectId ?? ''],
  )

  const isLoading =
    isFirstRender && (projectRes === undefined || placeLevelsRes === undefined)

  if (!projectId) {
    // Account context: only the 'projects' table is available
    const combinedValue = row.table_name === 'projects' ? 'projects' : ''
    const handleChange = (_e, data) => {
      const val = data.optionValue ?? null
      onChange(
        {
          target: { name: 'table_name', type: 'radio' },
        } as React.ChangeEvent<HTMLInputElement>,
        { value: val },
      )
      onChange(
        {
          target: { name: 'level', type: 'radio' },
        } as React.ChangeEvent<HTMLInputElement>,
        { value: null },
      )
    }
    return (
      <Field
        label={tableLabel}
        validationMessage={validations?.table_name?.message}
        validationState={validations?.table_name?.state ?? 'none'}
      >
        <Dropdown
          name="table_name"
          value={combinedValue}
          selectedOptions={combinedValue ? [combinedValue] : []}
          onOptionSelect={handleChange}
          appearance="underline"
          ref={autoFocusRef}
          clearable
        >
          <Option value="projects">
            {formatMessage({ id: 'qc.projects', defaultMessage: 'Projekte' })}
          </Option>
        </Dropdown>
      </Field>
    )
  }

  // Project context
  const subprojectsLabel =
    (projectRes?.rows?.[0]?.name_plural as string | null | undefined) ??
    formatMessage({
      id: 'field.fallbackSubprojects',
      defaultMessage: 'Teil-Projekt',
    })

  const level1Row = placeLevelsRes?.rows?.find((r) => r.level === 1)
  const level2Row = placeLevelsRes?.rows?.find((r) => r.level === 2)
  const fallbackPlaceLevel1 = formatMessage({
    id: 'field.fallbackPlaceLevel1',
    defaultMessage: 'Ort Stufe 1',
  })
  const fallbackPlaceLevel2 = formatMessage({
    id: 'field.fallbackPlaceLevel2',
    defaultMessage: 'Ort Stufe 2',
  })

  const plural1 =
    (level1Row?.name_plural as string | null | undefined) ?? fallbackPlaceLevel1
  const singular1 =
    (level1Row?.name_singular as string | null | undefined) ??
    fallbackPlaceLevel1
  const plural2 =
    (level2Row?.name_plural as string | null | undefined) ?? fallbackPlaceLevel2
  const singular2 =
    (level2Row?.name_singular as string | null | undefined) ??
    fallbackPlaceLevel2
  const actionsLabel = (place: string) =>
    formatMessage(
      { id: 'field.actions', defaultMessage: '{place}: Massnahmen' },
      { place },
    )
  const actionReportsLabel = (place: string) =>
    formatMessage(
      {
        id: 'field.actionReports',
        defaultMessage: '{place}: Massnahmen-Berichte',
      },
      { place },
    )
  const checksLabel = (place: string) =>
    formatMessage(
      { id: 'field.checks', defaultMessage: '{place}: Kontrollen' },
      { place },
    )
  const checkReportsLabel = (place: string) =>
    formatMessage(
      {
        id: 'field.checkReports',
        defaultMessage: '{place}: Kontroll-Berichte',
      },
      { place },
    )
  const observationsLabel = (place: string) =>
    formatMessage(
      { id: 'field.observations', defaultMessage: '{place}: Beobachtungen' },
      { place },
    )
  const filesLabel = (place: string) =>
    formatMessage(
      { id: 'field.files', defaultMessage: '{place}: Dateien' },
      { place },
    )

  const labelMap: Record<string, string> = {
    places_1: plural1,
    places_2: plural2,
    actions_1: actionsLabel(singular1),
    actions_2: actionsLabel(singular2),
    action_reports_1: actionReportsLabel(singular1),
    action_reports_2: actionReportsLabel(singular2),
    checks_1: checksLabel(singular1),
    checks_2: checksLabel(singular2),
    check_reports_1: checkReportsLabel(singular1),
    check_reports_2: checkReportsLabel(singular2),
    observations_1: observationsLabel(singular1),
    observations_2: observationsLabel(singular2),
    files_1: filesLabel(singular1),
    files_2: filesLabel(singular2),
    subprojects: subprojectsLabel,
    goals: formatMessage({ id: 'field.goals', defaultMessage: 'Art: Ziele' }),
    goal_reports: formatMessage({
      id: 'field.goalReports',
      defaultMessage: 'Art: Ziel-Berichte',
    }),
    project_reports: formatMessage({
      id: 'field.projectReports',
      defaultMessage: 'Projekt: Berichte',
    }),
    subproject_reports: formatMessage({
      id: 'field.subprojectReports',
      defaultMessage: 'Art: Berichte',
    }),
    taxa: formatMessage({ id: 'field.taxa', defaultMessage: 'Art: Taxa' }),
    taxonomies: formatMessage({
      id: 'field.taxonomies',
      defaultMessage: 'Projekt: Taxonomien',
    }),
    lists: formatMessage({
      id: 'field.lists',
      defaultMessage: 'Projekt: Listen',
    }),
  }

  const combinedValue = row.table_name
    ? row.level != null && placeScopedTables.has(row.table_name)
      ? `${row.table_name}_${row.level}`
      : row.table_name
    : ''

  const handleChange = (_e, data) => {
    const opt = data.optionValue
      ? (opts.find((o) => o.id === data.optionValue) ?? null)
      : null
    onChange(
      {
        target: { name: 'table_name', type: 'radio' },
      } as React.ChangeEvent<HTMLInputElement>,
      { value: opt?.table_name ?? null },
    )
    onChange(
      {
        target: { name: 'level', type: 'radio' },
      } as React.ChangeEvent<HTMLInputElement>,
      { value: opt?.level != null ? String(opt.level) : null },
    )
  }

  return (
    <Field
      label={tableLabel}
      validationMessage={
        validations?.table_name?.message ??
        (!row.table_name
          ? formatMessage({ id: 'Rq3wXp', defaultMessage: 'Pflichtfeld' })
          : undefined)
      }
      validationState={validations?.table_name?.state ?? 'none'}
    >
      <Dropdown
        name="table_name"
        value={isLoading ? '' : (labelMap[combinedValue] ?? combinedValue)}
        selectedOptions={combinedValue ? [combinedValue] : []}
        onOptionSelect={handleChange}
        appearance="underline"
        ref={autoFocusRef}
        clearable
      >
        {opts.map((o) => (
          <Option key={o.id} value={o.id}>
            {labelMap[o.id] ?? o.id}
          </Option>
        ))}
      </Dropdown>
    </Field>
  )
}
