import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import {
  checks1FilterAtom,
  checks2FilterAtom,
  treeOpenNodesAtom,
} from '../store.ts'

export const useChecksNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const [filter] = useAtom(placeId2 ? checks2FilterAtom : checks1FilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveQuery(
    `
      SELECT 
        check_id as id, 
        label 
      FROM checks 
      WHERE 
        place_id = $1 
        ${isFiltered ? ` AND ${filterString} ` : ''}
      ORDER BY label`,
    [placeId2 ?? placeId],
  )

  const loading = res === undefined

  const resultCountUnfiltered = useLiveQuery(
    `
      SELECT count(*) 
      FROM checks 
      WHERE place_id = $1`,
    [placeId2 ?? placeId],
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
      'places',
      placeId,
      ...(placeId2 ? ['places', placeId2] : []),
    ]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, 'checks']
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
        namePlural: 'Checks',
      }),
      nameSingular: 'Check',
      navs,
    }
  }, [
    countUnfiltered,
    isFiltered,
    loading,
    location.pathname,
    openNodes,
    placeId,
    placeId2,
    projectId,
    res?.rows,
    subprojectId,
  ])

  return { loading, navData, isFiltered }
}
