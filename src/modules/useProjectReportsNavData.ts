import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { projectReportsFilterAtom, treeOpenNodesAtom } from '../store.ts'

export const useProjectReportsNavData = ({ projectId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const parentArray = useMemo(
    () => ['data', 'projects', projectId],
    [projectId],
  )
  const ownArray = useMemo(() => [...parentArray, 'reports'], [parentArray])
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = useMemo(
    () => openNodes.some((array) => isEqual(array, ownArray)),
    [openNodes, ownArray],
  )

  const [filter] = useAtom(projectReportsFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const sql =
    isOpen ?
      `
      WITH
        count_unfiltered AS (SELECT count(*) FROM project_reports WHERE project_id = '${projectId}'),
        count_filtered AS (SELECT count(*) FROM project_reports WHERE project_id = '${projectId}' ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        project_report_id AS id,
        label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM project_reports, count_unfiltered, count_filtered
      WHERE
        project_id = '${projectId}'
        ${isFiltered ? ` AND ${filterString}` : ''}
      ORDER BY label
    `
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM project_reports WHERE project_id = '${projectId}'),
        count_filtered AS (SELECT count(*) FROM project_reports WHERE project_id = '${projectId}' ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `
  const res = useLiveQuery(sql)

  const loading = res === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const countUnfiltered = navs[0]?.count_unfiltered ?? 0
    const countFiltered = navs[0]?.count_filtered ?? 0

    const parentUrl = `/${parentArray.join('/')}`
    const ownUrl = `/${ownArray.join('/')}`
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return {
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
        namePlural: 'Reports',
      }),
      nameSingular: 'Project Report',
      navs,
    }
  }, [
    isFiltered,
    isOpen,
    loading,
    location.pathname,
    ownArray,
    parentArray,
    res?.rows,
  ])

  return { loading, navData, isFiltered }
}
