import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { subprojectNamePluralExpr } from './subprojectNameCols.ts'
import { chartsFilterAtom, treeOpenNodesAtom, languageAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId?: string
  placeId?: string
  placeId2?: string
  /**
   * project-level only: whether the section holds the chart templates for
   * all subprojects (true) or the project's own charts (false)
   */
  forSubprojects?: boolean
  /** url segment of the charts section — the project level has two of them */
  section?: 'charts' | 'subproject-charts'
}

type NavData = {
  id: string
  label: string
  count_unfiltered?: number
  count_filtered?: number
}[]

export const useChartsNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  forSubprojects,
  section,
}: Props) => {
  const { formatMessage } = useIntl()
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filter] = useAtom(chartsFilterAtom)
  const [language] = useAtom(languageAtom)
  const location = useLocation()

  // within a subproject, the project's chart templates (for_subprojects)
  // appear alongside the subproject's own charts. On the project itself,
  // the two sections are separate: charts and charts for subprojects
  const whereClause =
    placeId2 || placeId ?
      `charts.place_id = '${placeId2 ?? placeId}'`
    : subprojectId ?
      `(charts.subproject_id = '${subprojectId}' OR (charts.for_subprojects AND charts.project_id = '${projectId}' AND charts.subproject_id IS NULL))`
    : `charts.project_id = '${projectId}' AND charts.for_subprojects = ${forSubprojects ? 'TRUE' : 'FALSE'}`

  const chartsSegment = section ?? 'charts'
  const parentArray = [
    'data',
    ...(projectId ? ['projects', projectId] : []),
    ...(subprojectId ? ['subprojects', subprojectId] : []),
    ...(placeId ? ['places', placeId] : []),
    ...(placeId2 ? ['places', placeId2] : []),
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, chartsSegment]
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  // the subprojects section is named after the project's own term for its
  // subprojects (e.g. "Arten-Diagramme")
  const nameRes = useLiveQuery(
    `SELECT ${subprojectNamePluralExpr(language)} AS name_plural FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const subprojectsPlural =
    (nameRes?.rows?.[0]?.name_plural as string | undefined) ??
    formatMessage({ id: 'bEaAfF', defaultMessage: 'Teilprojekte' })
  const namePlural = forSubprojects ?
      formatMessage(
        { id: 'bFcCdD', defaultMessage: '{subprojects}-Diagramme' },
        { subprojects: subprojectsPlural },
      )
    : formatMessage({ id: 'ZPEO8P', defaultMessage: 'Diagramme' })
  const nameSingular = forSubprojects ?
      formatMessage(
        { id: 'bFdDeE', defaultMessage: '{subprojects}-Diagramm' },
        { subprojects: subprojectsPlural },
      )
    : formatMessage({ id: 'vMlktr', defaultMessage: 'Diagramm' })

  const filterString = filterStringFromFilter(
    filter as Record<string, unknown> & typeof filter,
    '',
  )
  const isFiltered = !!filterString

  const sql = `
    ${
      isOpen
        ? `
      WITH
        count_unfiltered AS (SELECT count(*) FROM charts WHERE ${whereClause}),
        count_filtered AS (SELECT count(*) FROM charts WHERE ${whereClause} ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        chart_id as id,
        label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM charts, count_unfiltered, count_filtered
      WHERE ${whereClause}
      ${isFiltered ? ` AND ${filterString}` : ''}
      ORDER BY label
    `
        : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM charts WHERE ${whereClause}),
        count_filtered AS (SELECT count(*) FROM charts WHERE ${whereClause} ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `
    }
  `

  const res = useLiveQuery<NavData[number]>(sql)

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  const countUnfiltered = navs[0]?.count_unfiltered ?? 0
  const countFiltered = navs[0]?.count_filtered ?? 0
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label: buildNavLabel({
      countFiltered,
      countUnfiltered,
      namePlural,
      loading,
      isFiltered,
    }),
    nameSingular,
    navs,
  }

  return { loading, navData, isFiltered }
}
