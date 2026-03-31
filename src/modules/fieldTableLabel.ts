import { getPlaceFallbackNames } from './placeNameFallback.ts'
import { projectTypeNames } from './projectTypeNames.ts'

type FormatMessage = (descriptor: { id: string; defaultMessage: string }, values?: Record<string, unknown>) => string

type BuildFieldTableLabelMapParams = {
  formatMessage: FormatMessage
  language: string
  projectType: string
  subprojectsLabel: string
  singular1: string
  singular2: string
  plural1: string
  plural2: string
}

type ResolveFieldTableContextParams = {
  formatMessage: FormatMessage
  language: string
  projectType?: string | null
  projectNamePlural?: string | null
  placeLevel1Singular?: string | null
  placeLevel1Plural?: string | null
  placeLevel2Singular?: string | null
  placeLevel2Plural?: string | null
}

export const placeScopedFieldTables = new Set([
  'places',
  'checks',
  'check_reports',
  'actions',
  'action_reports',
  'observations',
  'files',
])

export const getFieldTableOptionKey = ({ tableName, level }: { tableName?: string | null; level?: number | null }) => {
  if (!tableName) return ''
  if (level != null && placeScopedFieldTables.has(tableName)) {
    return `${tableName}_${level}`
  }
  return tableName
}

export const resolveFieldTableContext = ({
  formatMessage,
  language,
  projectType,
  projectNamePlural,
  placeLevel1Singular,
  placeLevel1Plural,
  placeLevel2Singular,
  placeLevel2Plural,
}: ResolveFieldTableContextParams) => {
  const resolvedProjectType = projectType ?? 'species'
  const subprojectsLabel =
    projectNamePlural ??
    projectTypeNames[resolvedProjectType]?.[
      language !== 'de' ? `subproject_name_plural_${language}` : 'subproject_name_plural'
    ] ??
    formatMessage({ id: 'bEaAfF', defaultMessage: 'Teilprojekte' })

  const fallback1 = getPlaceFallbackNames(resolvedProjectType, 1, formatMessage)
  const fallback2 = getPlaceFallbackNames(resolvedProjectType, 2, formatMessage)

  return {
    projectType: resolvedProjectType,
    subprojectsLabel,
    singular1: placeLevel1Singular ?? fallback1.singular,
    plural1: placeLevel1Plural ?? fallback1.plural,
    singular2: placeLevel2Singular ?? fallback2.singular,
    plural2: placeLevel2Plural ?? fallback2.plural,
  }
}

export const buildFieldTableLabelMap = ({
  formatMessage,
  subprojectsLabel,
  singular1,
  singular2,
  plural1,
  plural2,
}: BuildFieldTableLabelMapParams) => ({
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
    { id: 'field.actionReports', defaultMessage: '{place}: Massnahmen-Berichte' },
    { place: singular1 },
  ),
  action_reports_2: formatMessage(
    { id: 'field.actionReports', defaultMessage: '{place}: Massnahmen-Berichte' },
    { place: singular2 },
  ),
  checks_1: formatMessage(
    { id: 'field.checks', defaultMessage: '{place}: Kontrollen' },
    { place: singular1 },
  ),
  checks_2: formatMessage(
    { id: 'field.checks', defaultMessage: '{place}: Kontrollen' },
    { place: singular2 },
  ),
  check_reports_1: formatMessage(
    { id: 'field.checkReports', defaultMessage: '{place}: Kontroll-Berichte' },
    { place: singular1 },
  ),
  check_reports_2: formatMessage(
    { id: 'field.checkReports', defaultMessage: '{place}: Kontroll-Berichte' },
    { place: singular2 },
  ),
  observations_1: formatMessage(
    { id: 'field.observations', defaultMessage: '{place}: Beobachtungen' },
    { place: singular1 },
  ),
  observations_2: formatMessage(
    { id: 'field.observations', defaultMessage: '{place}: Beobachtungen' },
    { place: singular2 },
  ),
  files_1: formatMessage(
    { id: 'field.files', defaultMessage: '{place}: Dateien' },
    { place: singular1 },
  ),
  files_2: formatMessage(
    { id: 'field.files', defaultMessage: '{place}: Dateien' },
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
  projects: formatMessage({ id: 'qc.projects', defaultMessage: 'Projekte' }),
})

export const buildFieldNavItemLabel = ({
  tableLabel,
  fieldName,
  fallback,
}: {
  tableLabel?: string | null
  fieldName?: string | null
  fallback?: string | null
}) => {
  if (tableLabel && fieldName) return `${tableLabel}: ${fieldName}`
  if (fieldName) return fieldName
  if (tableLabel) return tableLabel
  return fallback ?? ''
}
