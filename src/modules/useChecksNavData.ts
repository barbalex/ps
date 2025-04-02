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

  const parentArray = useMemo(
    () => [
      'data',
      'projects',
      projectId,
      'subprojects',
      subprojectId,
      'places',
      placeId,
      ...(placeId2 ? ['places', placeId2] : []),
    ],
    [placeId, placeId2, projectId, subprojectId],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(() => [...parentArray, 'checks'], [parentArray])
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = useMemo(
    () => openNodes.some((array) => isEqual(array, ownArray)),
    [openNodes, ownArray],
  )

  const [filter] = useAtom(placeId2 ? checks2FilterAtom : checks1FilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const sql =
    isOpen ?
      `
      WITH 
        count_unfiltered AS (SELECT count(*) FROM checks WHERE place_id = '${placeId2 ?? placeId}'),
        count_filtered AS (SELECT count(*) FROM checks WHERE place_id = '${placeId2 ?? placeId}'${isFiltered ? ` AND ${filterString}` : ''})
      SELECT 
        check_id AS id,
        label, 
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM checks, count_unfiltered, count_filtered
      WHERE 
        place_id = '${placeId2 ?? placeId}'
        ${isFiltered ? `AND ${filterString}` : ''} 
      ORDER BY label
    `
    : `
      WITH 
        count_unfiltered AS (SELECT count(*) FROM checks WHERE place_id = '${placeId2 ?? placeId}'),
        count_filtered AS (SELECT count(*) FROM checks WHERE place_id = '${placeId2 ?? placeId}'${isFiltered ? ` AND ${filterString}` : ''})
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
        namePlural: 'Checks',
      }),
      nameSingular: 'Check',
      navs,
    }
  }, [
    isFiltered,
    isOpen,
    loading,
    location.pathname,
    ownArray,
    ownUrl,
    parentUrl,
    res?.rows,
  ])

  return { loading, navData, isFiltered }
}
