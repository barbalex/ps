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

const labelMessages = {
  checks: { id: 'bEcChH', defaultMessage: 'Kontrollen' },
  check_values: { id: 'bEdDiI', defaultMessage: 'Kontrollwerte' },
  actions: { id: 'bEeEjJ', defaultMessage: 'Ma\u00dfnahmen' },
  action_values: { id: 'bEfFkK', defaultMessage: 'Ma\u00dfnahmenwerte' },
}

export const Table = ({ onChange, row, ref, validations }) => {
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const { projectId_ } = useParams({ from })
  const isFirstRender = useIsFirstRender()

  const res = useLiveQuery(
    `SELECT table_name FROM chart_subject_table_names order by sort, table_name`,
  )
  const isLoading = isFirstRender && res === undefined
  const list = res?.rows.map((row) => row.table_name) ?? []

  const projectRes = useLiveQuery(
    `SELECT ${subprojectNamePluralExpr(language)} AS name_plural, type FROM projects WHERE project_id = $1`,
    [projectId_],
  )
  const projectType = projectRes?.rows[0]?.type
  const subprojectsLabel =
    (projectRes?.rows[0]?.name_plural as string | null | undefined) ??
    projectTypeNames[projectType ?? 'species']?.[
      language !== 'de'
        ? `subproject_name_plural_${language}`
        : 'subproject_name_plural'
    ] ??
    formatMessage({ id: 'bEaAfF', defaultMessage: 'Teilprojekte' })

  const placesRes = useLiveQuery(
    `SELECT name_plural_${language} AS name_plural FROM place_levels WHERE project_id = $1 AND level = 1`,
    [projectId_],
  )
  const placeFallback = getPlaceFallbackNames(projectType, 1, formatMessage)
  const placesLabel = placesRes?.rows[0]?.name_plural ?? placeFallback.plural

  const labelMap = {
    subprojects: subprojectsLabel,
    places: placesLabel,
    ...Object.fromEntries(
      Object.entries(labelMessages).map(([k, v]) => [k, formatMessage(v)]),
    ),
  }

  return (
    <RadioGroupField
      label={formatMessage({ id: 'bDcFiG', defaultMessage: 'Tabelle' })}
      name="table_name"
      list={list}
      isLoading={isLoading}
      value={row.table_name ?? ''}
      onChange={onChange}
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
