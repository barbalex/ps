import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import {
  places1FilterAtom,
  places2FilterAtom,
  treeOpenNodesAtom,
} from '../store.ts'

export const usePlacesNavData = ({ projectId, subprojectId, placeId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const parentArray = useMemo(
    () => [
      'data',
      'projects',
      projectId,
      'subprojects',
      subprojectId,
      ...(placeId ? ['places', placeId] : []),
    ],
    [placeId, projectId, subprojectId],
  )
  const ownArray = useMemo(() => [...parentArray, 'places'], [parentArray])
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = useMemo(
    () => openNodes.some((array) => isEqual(array, ownArray)),
    [openNodes, ownArray],
  )

  const [filter] = useAtom(placeId ? places2FilterAtom : places1FilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString

  const sql =
    isOpen ?
      `
      WITH
        count_unfiltered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id ${
          placeId ? `= $2` : `IS NULL`
        }),
        count_filtered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id ${
          placeId ? `= $2` : `IS NULL`
        } ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        place_id AS id,
        label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM places, count_unfiltered, count_filtered
      WHERE subproject_id = '${subprojectId}'
        AND parent_id ${placeId ? `= $2` : `IS NULL`}
        ${isFiltered ? ` AND ${filterString}` : ''}
      ORDER BY label
    `
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' and parent_id ${
          placeId ? `= $2` : `IS NULL`
        }),
        count_filtered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' and parent_id ${
          placeId ? `= $2` : `IS NULL`
        } ${isFiltered ? ` AND ${filterString}` : ''})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `
  const res = useLiveQuery(sql)

  const loading = res === undefined

  const resultPlaceLevels = useLiveQuery(
    `SELECT name_singular, name_plural FROM place_levels WHERE project_id = $1 and level = $2 order by label`,
    [projectId, placeId ? 2 : 1],
  )
  const placeLevel = resultPlaceLevels?.rows?.[0]
  const placeNameSingular = placeLevel?.name_singular ?? 'Place'
  const placeNamePlural = placeLevel?.name_plural ?? 'Places'

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
        namePlural: placeNamePlural,
      }),
      nameSingular: placeNameSingular,
      namePlural: placeNamePlural,
      navs,
    }
  }, [
    isFiltered,
    isOpen,
    loading,
    location.pathname,
    ownArray,
    parentArray,
    placeNamePlural,
    placeNameSingular,
    res?.rows,
  ])

  return { loading, navData, isFiltered }
}
