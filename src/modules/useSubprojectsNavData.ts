import { useUrlFilter } from './useUrlFilter.ts'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesSetAtom, languageAtom } from '../store.ts'
import {
  subprojectNameSingularExpr,
  subprojectNamePluralExpr,
} from './subprojectNameCols.ts'

type Props = {
  projectId: string
  list?: boolean
}

type NavDataOpen = {
  id: string
  label: string
  name_singular: string
  name_plural: string
  count_unfiltered: number
  count_filtered: number
}

type NavDataClosed = {
  name_singular: string
  name_plural: string
  count_unfiltered: number
  count_filtered: number
}

export const useSubprojectsNavData = ({ projectId, list }: Props) => {
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const parentArray = ['data', 'projects', projectId]
  const ownArray = [...parentArray, 'subprojects']
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodesSet.has(ownArray.join('/'))

  const [filter] = useUrlFilter('subprojects')
  const [language] = useAtom(languageAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const condition = isFiltered ? `AND (${filterString})` : ''
  const sql =
    isOpen || list ?
      `
      WITH 
        count_unfiltered AS (SELECT count(*) FROM subprojects WHERE project_id = '${projectId}'),
        count_filtered AS (SELECT count(*) FROM subprojects WHERE project_id = '${projectId}' ${condition})
      SELECT 
        sp.subproject_id AS id,
        sp.label, 
        ${subprojectNamePluralExpr(language, 'p')} AS name_plural, 
        ${subprojectNameSingularExpr(language, 'p')} AS name_singular,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM projects p
        CROSS JOIN count_unfiltered CROSS JOIN count_filtered
        LEFT JOIN subprojects sp ON p.project_id = sp.project_id
        ${isFiltered ? `AND (${filterStringFromFilter(filter, 'sp')})` : ''}
      WHERE p.project_id = '${projectId}'
      ORDER BY sp.label
    `
    : `
      WITH 
        count_unfiltered AS (SELECT count(*) FROM subprojects WHERE project_id = '${projectId}'),
        count_filtered AS (SELECT count(*) FROM subprojects WHERE project_id = '${projectId}' ${condition}),
        names AS (SELECT ${subprojectNameSingularExpr(language)} AS subproject_name_singular, ${subprojectNamePluralExpr(language)} AS subproject_name_plural FROM projects WHERE project_id = '${projectId}')
      SELECT 
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered,
        names.subproject_name_singular AS name_singular,
        names.subproject_name_plural AS name_plural
      FROM count_unfiltered, count_filtered, names
    `
  const res = useLiveQuery(sql)

  const loading = res === undefined

  const parentUrl = `/${parentArray.join('/')}`
  const ownUrl = `/${ownArray.join('/')}`
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const rows = (res?.rows ?? []) as (NavDataClosed & {
    id?: string | null
    label?: string
  })[]
  const navs = rows.filter((row): row is NavDataOpen => !!row.id)
  const countUnfiltered = rows[0]?.count_unfiltered ?? 0
  const countFiltered = rows[0]?.count_filtered ?? 0

  const namePlural =
    rows[0]?.name_plural ||
    formatMessage({ id: 'Jou8/E', defaultMessage: 'Teilprojekte' })
  const nameSingular =
    rows[0]?.name_singular ||
    formatMessage({ id: 'gxCh0c', defaultMessage: 'Teilprojekt' })

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label: buildNavLabel({
      loading,
      isFiltered,
      countFiltered,
      countUnfiltered,
      namePlural,
    }),
    nameSingular,
    namePlural,
    navs,
  }

  return { loading, navData, isFiltered }
}
