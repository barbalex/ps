import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { formatNumber } from './formatNumber.ts'
import { goalsFilterAtom, treeOpenNodesAtom } from '../store.ts'

export const useGoalsNavData = ({ projectId, subprojectId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const [filter] = useAtom(goalsFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveQuery(
    `
    SELECT 
      goal_id AS id, 
      label
    FROM goals 
    WHERE 
      subproject_id = $1
      ${isFiltered ? ` AND ${filterString}` : ''} 
    ORDER BY label`,
    [subprojectId],
  )

  const loading = res === undefined

  const resultCountUnfiltered = useLiveQuery(
    `SELECT count(*) FROM goals WHERE subproject_id = $1`,
    [subprojectId],
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resultCountUnfiltered === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const parentArray = [
      'data',
      'projects',
      projectId,
      'subprojects',
      subprojectId,
    ]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, 'goals']
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
      label: `Goals (${
        isFiltered ?
          `${loading ? '...' : formatNumber(navs.length)}/${
            countLoading ? '...' : formatNumber(countUnfiltered)
          }`
        : loading ? '...'
        : formatNumber(navs.length)
      })`,
      nameSingular: 'Goal',
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
    subprojectId,
  ])

  return { loading, navData, isFiltered }
}
