import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useAtom } from 'jotai'
import { useParams } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { languageAtom } from '../../store.ts'
import { subprojectNamePluralExpr } from '../../modules/subprojectNameCols.ts'
import { getPlaceFallbackNames } from '../../modules/placeNameFallback.ts'
import { projectTypeNames } from '../../modules/projectTypeNames.ts'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/subjects/$chartSubjectId/'

type Option = {
  id: string
  table_name: string
  table_level: string | null
}

export const Table = ({ onChange, row, ref, validations }) => {
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const { projectId_ } = useParams({ from })
  const isFirstRender = useIsFirstRender()

  const projectRes = useLiveQuery(
    `SELECT ${subprojectNamePluralExpr(language)} AS name_plural, type FROM projects WHERE project_id = $1`,
    [projectId_],
  )
  const placeLevelsRes = useLiveQuery(
    `SELECT level,
      COALESCE(NULLIF(name_singular_${language}, ''), name_singular_de) AS name_singular,
      COALESCE(NULLIF(name_plural_${language}, ''), name_plural_de) AS name_plural
    FROM place_levels WHERE project_id = $1 ORDER BY level`,
    [projectId_],
  )

  const isLoading =
    isFirstRender && (projectRes === undefined || placeLevelsRes === undefined)

  const projectType = projectRes?.rows[0]?.type
  const subprojectsLabel =
    (projectRes?.rows[0]?.name_plural as string | null | undefined) ??
    projectTypeNames[projectType ?? 'species']?.[
      language !== 'de'
        ? `subproject_name_plural_${language}`
        : 'subproject_name_plural'
    ] ??
    formatMessage({ id: 'bEaAfF', defaultMessage: 'Teilprojekte' })

  const level1Row = placeLevelsRes?.rows?.find((r) => r.level === 1)
  const level2Row = placeLevelsRes?.rows?.find((r) => r.level === 2)
  const fallback1 = getPlaceFallbackNames(
    projectType ?? 'species',
    1,
    formatMessage,
  )
  const fallback2 = getPlaceFallbackNames(
    projectType ?? 'species',
    2,
    formatMessage,
  )

  const plural1 =
    (level1Row?.name_plural as string | null | undefined) ?? fallback1.plural
  const singular1 =
    (level1Row?.name_singular as string | null | undefined) ??
    fallback1.singular
  const plural2 =
    (level2Row?.name_plural as string | null | undefined) ?? fallback2.plural
  const singular2 =
    (level2Row?.name_singular as string | null | undefined) ??
    fallback2.singular

  const opts: Option[] = [
    { id: 'subprojects', table_name: 'subprojects', table_level: null },
    { id: 'places_1', table_name: 'places', table_level: '1' },
    { id: 'checks_1', table_name: 'checks', table_level: '1' },
    { id: 'check_values_1', table_name: 'check_values', table_level: '1' },
    { id: 'actions_1', table_name: 'actions', table_level: '1' },
    { id: 'action_values_1', table_name: 'action_values', table_level: '1' },
    { id: 'places_2', table_name: 'places', table_level: '2' },
    { id: 'checks_2', table_name: 'checks', table_level: '2' },
    { id: 'check_values_2', table_name: 'check_values', table_level: '2' },
    { id: 'actions_2', table_name: 'actions', table_level: '2' },
    { id: 'action_values_2', table_name: 'action_values', table_level: '2' },
  ]

  const labelMap: Record<string, string> = {
    subprojects: subprojectsLabel,
    places_1: plural1,
    checks_1: formatMessage(
      { id: 'bEgGlL', defaultMessage: '{place}-Kontrollen' },
      { place: singular1 },
    ),
    check_values_1: formatMessage(
      { id: 'bEhHmM', defaultMessage: '{place}-Kontroll-Mengen' },
      { place: singular1 },
    ),
    actions_1: formatMessage(
      { id: 'bEiInN', defaultMessage: '{place}-Massnahmen' },
      { place: singular1 },
    ),
    action_values_1: formatMessage(
      { id: 'bEjJoO', defaultMessage: '{place}-Massnahmen-Mengen' },
      { place: singular1 },
    ),
    places_2: plural2,
    checks_2: formatMessage(
      { id: 'bEgGlL', defaultMessage: '{place}-Kontrollen' },
      { place: singular2 },
    ),
    check_values_2: formatMessage(
      { id: 'bEhHmM', defaultMessage: '{place}-Kontroll-Mengen' },
      { place: singular2 },
    ),
    actions_2: formatMessage(
      { id: 'bEiInN', defaultMessage: '{place}-Massnahmen' },
      { place: singular2 },
    ),
    action_values_2: formatMessage(
      { id: 'bEjJoO', defaultMessage: '{place}-Massnahmen-Mengen' },
      { place: singular2 },
    ),
  }

  const list = opts.map((o) => o.id)

  const currentValue = row.table_name
    ? row.table_name === 'subprojects'
      ? 'subprojects'
      : `${row.table_name}_${row.table_level}`
    : ''

  const handleChange = (
    _e: React.ChangeEvent<HTMLInputElement>,
    data: { value: string | null },
  ) => {
    const selected = data.value ? opts.find((o) => o.id === data.value) : null
    onChange(
      {
        target: { name: 'table_name', type: 'radio' },
      } as React.ChangeEvent<HTMLInputElement>,
      { value: selected?.table_name ?? null },
    )
    onChange(
      {
        target: { name: 'table_level', type: 'radio' },
      } as React.ChangeEvent<HTMLInputElement>,
      { value: selected?.table_level ?? null },
    )
  }

  return (
    <RadioGroupField
      label={formatMessage({ id: 'bDcFiG', defaultMessage: 'Tabelle' })}
      name="table_and_level"
      list={list}
      isLoading={isLoading}
      value={currentValue}
      onChange={handleChange}
      labelMap={labelMap}
      autoFocus
      ref={ref}
      validationState={validations?.table_name?.state}
      validationMessage={
        validations.table_name?.message ??
        formatMessage({
          id: 'bDdGjH',
          defaultMessage:
            'W\u00e4hlen Sie die Tabelle, aus der Daten geladen werden',
        })
      }
    />
  )
}
