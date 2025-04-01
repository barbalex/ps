import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { formatNumber } from './formatNumber.ts'
import {
  places1FilterAtom,
  places2FilterAtom,
  treeOpenNodesAtom,
} from '../store.ts'

export const usePlacesNavData = ({ projectId, subprojectId, placeId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const [filter] = useAtom(placeId ? places2FilterAtom : places1FilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const res = useLiveQuery(
    `
      SELECT
        place_id AS id,
        label 
      FROM places 
      WHERE 
        subproject_id = $1 
        and parent_id ${placeId ? `= '${placeId}'` : `is null`}
        ${isFiltered ? ` AND ${filterString} ` : ''} 
      ORDER BY label`,
    [subprojectId],
  )

  const loading = res === undefined

  const resultCountUnfiltered = useLiveQuery(
    `SELECT count(*) FROM places WHERE subproject_id = $1 and parent_id ${
      placeId ? `= $2` : `IS NULL`
    }`,
    [subprojectId, ...(placeId ? [placeId] : [])],
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resultCountUnfiltered === undefined

  const resultPlaceLevels = useLiveQuery(
    `SELECT * FROM place_levels WHERE project_id = $1 and level = $2 order by label`,
    [projectId, placeId ? 2 : 1],
  )
  const placeLevel = resultPlaceLevels?.rows?.[0]
  const placeNameSingular = placeLevel?.name_singular ?? 'Place'
  const placeNamePlural = placeLevel?.name_plural ?? 'Places'

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const parentArray = [
      'data',
      'projects',
      projectId,
      'subprojects',
      subprojectId,
      ...(placeId ? ['places', placeId] : []),
    ]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, 'places']
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
      label: `${placeNamePlural} (${
        isFiltered ?
          `${loading ? '...' : formatNumber(navs.length)}/${
            countLoading ? '...' : formatNumber(countUnfiltered)
          }`
        : loading ? '...'
        : formatNumber(navs.length)
      })`,
      nameSingular: placeNameSingular,
      namePlural: placeNamePlural,
      navs,
    }
  }, [
    countLoading,
    countUnfiltered,
    isFiltered,
    loading,
    location.pathname,
    openNodes,
    placeId,
    placeNamePlural,
    placeNameSingular,
    projectId,
    res?.rows,
    subprojectId,
  ])

  return { loading, navData, isFiltered }
}
