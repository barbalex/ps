import * as fluentUiReactComponents from '@fluentui/react-components'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { languageAtom } from '../../store.ts'
import { subprojectNamePluralExpr } from '../../modules/subprojectNameCols.ts'
import { getPlaceFallbackNames } from '../../modules/placeNameFallback.ts'
import { projectTypeNames } from '../../modules/projectTypeNames.ts'

const { Dropdown, Field, Option } = fluentUiReactComponents

type Opt = { id: string; table_name: string; level: number | null }

// Options ordered hierarchically (subproject scope → place level 1 → place level 2)
// mirroring the nav tree order
const opts: Opt[] = [
  // ── Subproject scope (no place-level) ──────────────────────────
  { id: 'subprojects',       table_name: 'subprojects',       level: null },
  { id: 'project_reports',   table_name: 'project_reports',   level: null },
  { id: 'lists',             table_name: 'lists',             level: null },
  { id: 'taxonomies',        table_name: 'taxonomies',        level: null },
  { id: 'subproject_reports', table_name: 'subproject_reports', level: null },
  { id: 'goals',             table_name: 'goals',             level: null },
  { id: 'goal_reports',      table_name: 'goal_reports',      level: null },
  { id: 'taxa',              table_name: 'taxa',              level: null },
  // ── Place level 1 ─────────────────────────────────────────────
  { id: 'places_1',          table_name: 'places',            level: 1 },
  { id: 'actions_1',         table_name: 'actions',           level: 1 },
  { id: 'action_reports_1',  table_name: 'action_reports',    level: 1 },
  { id: 'checks_1',          table_name: 'checks',            level: 1 },
  { id: 'check_reports_1',   table_name: 'check_reports',     level: 1 },
  { id: 'observations_1',    table_name: 'observations',      level: 1 },
  { id: 'files_1',           table_name: 'files',             level: 1 },
  // ── Place level 2 ─────────────────────────────────────────────
  { id: 'places_2',          table_name: 'places',            level: 2 },
  { id: 'actions_2',         table_name: 'actions',           level: 2 },
  { id: 'action_reports_2',  table_name: 'action_reports',    level: 2 },
  { id: 'checks_2',          table_name: 'checks',            level: 2 },
  { id: 'check_reports_2',   table_name: 'check_reports',     level: 2 },
  { id: 'observations_2',    table_name: 'observations',      level: 2 },
  { id: 'files_2',           table_name: 'files',             level: 2 },
]

export const TableAndLevel = ({ projectId, onChange, row, validations, autoFocusRef }) => {
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const isFirstRender = useIsFirstRender()

  // Always call hooks unconditionally; use WHERE false when not in project context
  const projectRes = useLiveQuery(
    `SELECT ${subprojectNamePluralExpr(language)} AS name_plural, type FROM projects WHERE $1::boolean AND project_id = $2`,
    [!!projectId, projectId ?? ''],
  )
  const placeLevelsRes = useLiveQuery(
    `SELECT level,
      COALESCE(NULLIF(name_singular_${language}, ''), name_singular_de) AS name_singular,
      COALESCE(NULLIF(name_plural_${language}, ''), name_plural_de) AS name_plural
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
        { target: { name: 'table_name', type: 'radio' } } as React.ChangeEvent<HTMLInputElement>,
        { value: val },
      )
      onChange(
        { target: { name: 'level', type: 'radio' } } as React.ChangeEvent<HTMLInputElement>,
        { value: null },
      )
    }
    return (
      <Field
        label={formatMessage({ id: 'Tb8kLm', defaultMessage: 'Tabelle' })}
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
  const projectType = projectRes?.rows?.[0]?.type ?? 'species'
  const subprojectsLabel =
    (projectRes?.rows?.[0]?.name_plural as string | null | undefined) ??
    projectTypeNames[projectType]?.[
      language !== 'de'
        ? `subproject_name_plural_${language}`
        : 'subproject_name_plural'
    ] ??
    formatMessage({ id: 'bEaAfF', defaultMessage: 'Teilprojekte' })

  const level1Row = placeLevelsRes?.rows?.find((r) => r.level === 1)
  const level2Row = placeLevelsRes?.rows?.find((r) => r.level === 2)
  const fallback1 = getPlaceFallbackNames(projectType, 1, formatMessage)
  const fallback2 = getPlaceFallbackNames(projectType, 2, formatMessage)

  const plural1 = (level1Row?.name_plural as string | null | undefined) ?? fallback1.plural
  const singular1 = (level1Row?.name_singular as string | null | undefined) ?? fallback1.singular
  const plural2 = (level2Row?.name_plural as string | null | undefined) ?? fallback2.plural
  const singular2 = (level2Row?.name_singular as string | null | undefined) ?? fallback2.singular

  const labelMap: Record<string, string> = {
    places_1: plural1,
    places_2: plural2,
    actions_1: formatMessage(
      { id: 'field.actions', defaultMessage: '{place}: Massnahmen' },
      { place: singular1 },
    ),
    actions_2: formatMessage(
      { id: 'field.actions', defaultMessage: '{place}: Massnahmen' },
      { place: singular2 },
    ),
    action_reports_1: formatMessage(
      { id: 'field.actionReports', defaultMessage: '{place}-Massnahmen-Berichte' },
      { place: singular1 },
    ),
    action_reports_2: formatMessage(
      { id: 'field.actionReports', defaultMessage: '{place}-Massnahmen-Berichte' },
      { place: singular2 },
    ),
    checks_1: formatMessage(
      { id: 'bEgGlL', defaultMessage: '{place}-Kontrollen' },
      { place: singular1 },
    ),
    checks_2: formatMessage(
      { id: 'bEgGlL', defaultMessage: '{place}-Kontrollen' },
      { place: singular2 },
    ),
    check_reports_1: formatMessage(
      { id: 'field.checkReports', defaultMessage: '{place}-Kontroll-Berichte' },
      { place: singular1 },
    ),
    check_reports_2: formatMessage(
      { id: 'field.checkReports', defaultMessage: '{place}-Kontroll-Berichte' },
      { place: singular2 },
    ),
    observations_1: formatMessage(
      { id: 'field.observations', defaultMessage: '{place}-Beobachtungen' },
      { place: singular1 },
    ),
    observations_2: formatMessage(
      { id: 'field.observations', defaultMessage: '{place}-Beobachtungen' },
      { place: singular2 },
    ),
    files_1: formatMessage(
      { id: 'field.files', defaultMessage: '{place}-Dateien' },
      { place: singular1 },
    ),
    files_2: formatMessage(
      { id: 'field.files', defaultMessage: '{place}-Dateien' },
      { place: singular2 },
    ),
    subprojects: subprojectsLabel,
    goals: formatMessage({ id: 'field.goals', defaultMessage: 'Art: Ziele' }),
    goal_reports: formatMessage({ id: 'field.goalReports', defaultMessage: 'Art: Ziel-Berichte' }),
    project_reports: formatMessage({ id: 'field.projectReports', defaultMessage: 'Projekt: Berichte' }),
    subproject_reports: formatMessage({ id: 'field.subprojectReports', defaultMessage: 'Art: Berichte' }),
    taxa: formatMessage({ id: 'field.taxa', defaultMessage: 'Art: Taxa' }),
    taxonomies: formatMessage({ id: 'field.taxonomies', defaultMessage: 'Projekt: Taxonomien' }),
    lists: formatMessage({ id: 'field.lists', defaultMessage: 'Projekt: Listen' }),
  }

  const combinedValue = row.table_name
    ? row.level != null
      ? `${row.table_name}_${row.level}`
      : row.table_name
    : ''

  const handleChange = (_e, data) => {
    const opt = data.optionValue ? opts.find((o) => o.id === data.optionValue) ?? null : null
    onChange(
      { target: { name: 'table_name', type: 'radio' } } as React.ChangeEvent<HTMLInputElement>,
      { value: opt?.table_name ?? null },
    )
    onChange(
      { target: { name: 'level', type: 'radio' } } as React.ChangeEvent<HTMLInputElement>,
      { value: opt?.level != null ? String(opt.level) : null },
    )
  }

  return (
    <Field
      label={formatMessage({ id: 'Tb8kLm', defaultMessage: 'Tabelle' })}
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
