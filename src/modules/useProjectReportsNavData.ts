import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { formatNumber } from './formatNumber.ts'
import { projectReportsFilterAtom, treeOpenNodesAtom } from '../store.ts'

export const useProjectReportsNavData = ({ projectId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const [filter] = useAtom(projectReportsFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveQuery(
    `
    SELECT
      project_report_id,
      label 
    FROM project_reports 
    WHERE 
      project_id = $1
      ${isFiltered ? ` AND ${filterString} ` : ''} 
    ORDER BY label`,
    [projectId],
  )

  const loading = res === undefined

  const resultCountUnfiltered = useLiveQuery(
    `SELECT count(*) FROM project_reports WHERE project_id = $1`,
    [projectId],
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resultCountUnfiltered === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const parentArray = ['data', 'projects', projectId]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, 'reports']
    const ownUrl = `/${ownArray.join('/')}`
    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
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
      toParams: {},
      label: `Reports (${
        isFiltered ?
          `${loading ? '...' : formatNumber(navs.length)}/${
            countLoading ? '...' : formatNumber(countUnfiltered)
          }`
        : loading ? '...'
        : formatNumber(navs.length)
      })`,
      nameSingular: 'Project Report',
      navs,
    }
  }, [
    countLoading,
    countUnfiltered,
    isFiltered,
    loading,
    location.pathname,
    openNodes,
    projectId,
    res?.rows,
  ])

  return { loading, navData, isFiltered }
}
