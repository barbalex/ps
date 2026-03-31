import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { subprojectNamePluralExpr } from './subprojectNameCols.ts'
import {
  buildFieldNavItemLabel,
  buildFieldTableLabelMap,
  getFieldTableOptionKey,
  resolveFieldTableContext,
} from './fieldTableLabel.ts'
import { fieldsFilterAtom, languageAtom, treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId?: string
  accountId?: string
}

type NavDataOpen = {
  id: string
  label: string
  table_name?: string
  level?: number | null
  name?: string | null
  count_unfiltered?: number
  count_filtered?: number
}[]

type NavDataClosed = {
  count_unfiltered: number
  count_filtered: number
}[]

export const useFieldsNavData = ({ projectId, accountId }: Props) => {
  const { formatMessage } = useIntl()
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [language] = useAtom(languageAtom)
  const location = useLocation()

  const whereScope = projectId
    ? `project_id = '${projectId}'`
    : accountId
      ? `project_id IS NULL AND account_id = '${accountId}'`
      : 'project_id IS NULL'
  const fieldsSegment = projectId ? 'fields' : accountId ? 'project-fields' : 'fields'

  const parentArray = [
    'data',
    ...(projectId ? ['projects', projectId] : accountId ? ['accounts', accountId] : []),
  ]

  const ownArray = [...parentArray, fieldsSegment]
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const [filter] = useAtom(fieldsFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const sql = isOpen
    ? `
      WITH
        count_unfiltered AS (SELECT count(*) FROM fields WHERE ${whereScope}),
        count_filtered AS (SELECT count(*) FROM fields WHERE ${whereScope}${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        field_id AS id,
        label,
        table_name,
        level,
        name,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM fields, count_unfiltered, count_filtered
      WHERE ${whereScope}
        ${isFiltered ? ` AND ${filterString}` : ''}
      ORDER BY table_name, name, level
    `
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM fields WHERE ${whereScope}),
        count_filtered AS (SELECT count(*) FROM fields WHERE ${whereScope}${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `
  const res = useLiveQuery(sql)

  const projectRes = useLiveQuery(
    `SELECT ${subprojectNamePluralExpr(language)} AS name_plural, type FROM projects WHERE $1::boolean AND project_id = $2`,
    [!!projectId, projectId ?? ''],
  )

  const placeLevelsRes = useLiveQuery(
    `SELECT
      level,
      COALESCE(NULLIF(name_singular_${language}, ''), name_singular_de) AS name_singular,
      COALESCE(NULLIF(name_plural_${language}, ''), name_plural_de) AS name_plural
    FROM place_levels
    WHERE $1::boolean AND project_id = $2
    ORDER BY level`,
    [!!projectId, projectId ?? ''],
  )

  const loading = res === undefined

  const navsRaw: NavDataOpen | NavDataClosed = res?.rows ?? []

  const level1Row = projectId
    ? placeLevelsRes?.rows?.find((r) => r.level === 1)
    : undefined
  const level2Row = projectId
    ? placeLevelsRes?.rows?.find((r) => r.level === 2)
    : undefined

  const tableContext = resolveFieldTableContext({
    formatMessage,
    language,
    projectType: (projectRes?.rows?.[0]?.type as string | null | undefined) ?? null,
    projectNamePlural: (projectRes?.rows?.[0]?.name_plural as string | null | undefined) ?? null,
    placeLevel1Singular: (level1Row?.name_singular as string | null | undefined) ?? null,
    placeLevel1Plural: (level1Row?.name_plural as string | null | undefined) ?? null,
    placeLevel2Singular: (level2Row?.name_singular as string | null | undefined) ?? null,
    placeLevel2Plural: (level2Row?.name_plural as string | null | undefined) ?? null,
  })

  const tableLabelMap = buildFieldTableLabelMap({
    formatMessage,
    language,
    projectType: tableContext.projectType,
    subprojectsLabel: tableContext.subprojectsLabel,
    singular1: tableContext.singular1,
    singular2: tableContext.singular2,
    plural1: tableContext.plural1,
    plural2: tableContext.plural2,
  })

  const navs: NavDataOpen | NavDataClosed = isOpen
    ? (navsRaw as NavDataOpen).map((row) => {
        const key = getFieldTableOptionKey({
          tableName: row.table_name,
          level: row.level,
        })
        const tableLabel = tableLabelMap[key] ?? row.table_name ?? key

        return {
          ...row,
          label: buildFieldNavItemLabel({
            tableLabel,
            fieldName: row.name,
            fallback: row.label,
          }),
        }
      })
    : navsRaw

  const countUnfiltered = navs[0]?.count_unfiltered ?? 0
  const countFiltered = navs[0]?.count_filtered ?? 0

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentUrl = `/${parentArray.join('/')}`
  const ownUrl = `/${ownArray.join('/')}`

  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    label: buildNavLabel({
      loading,
      isFiltered,
      countFiltered,
      countUnfiltered,
      namePlural: formatMessage({ id: 'I+dTZE', defaultMessage: 'Felder' }),
    }),
    nameSingular: formatMessage({ id: '61ELuB', defaultMessage: 'Feld' }),
    navs,
  }

  return { loading, navData, isFiltered }
}
