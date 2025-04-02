import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { listsFilterAtom, treeOpenNodesAtom } from '../store.ts'

export const useListsNavData = ({ projectId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const [filter] = useAtom(listsFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveQuery(
    `
    SELECT 
      list_id AS id,
      label
    FROM lists 
    WHERE 
      project_id = $1
      ${isFiltered ? ` AND ${filterString} ` : ''} 
    ORDER BY label`,
    [projectId],
  )

  const loading = res === undefined

  const resultCountUnfiltered = useLiveQuery(
    `SELECT COUNT(*) FROM lists WHERE project_id = $1`,
    [projectId],
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resultCountUnfiltered === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const parentArray = ['data', 'projects', projectId]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, 'lists']
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
      label: buildNavLabel({
        loading,
        isFiltered,
        countFiltered: navs.length,
        countUnfiltered,
        namePlural: 'Lists',
      }),
      nameSingular: 'List',
      navs,
    }
  }, [
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
