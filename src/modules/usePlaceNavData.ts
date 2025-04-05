import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import isEqual from 'lodash/isEqual'

import { places1FilterAtom, treeOpenNodesAtom } from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filterStringFromFilter } from './filterStringFromFilter.ts'

export const usePlaceNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const [placesFilter] = useAtom(places1FilterAtom)
  const placesFilterString = filterStringFromFilter(placesFilter)
  const placesIsFiltered = !!placesFilterString

  const sql = `
      WITH
        names AS (SELECT name_singular FROM place_levels WHERE project_id = '${projectId}' AND level = ${placeId2 ? 2 : 1}),
        child_names as (SELECT name_plural FROM place_levels WHERE project_id = '${projectId}' AND level = 2),
        places_count_unfiltered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id ${
          placeId ? `= '${placeId}'` : `IS NULL`
        }),
        places_count_filtered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id ${
          placeId ? `= '${placeId}'` : `IS NULL`
        } ${placesIsFiltered ? ` AND ${placesFilterString}` : ''})
      SELECT
        place_id AS id,
        label,
        names.name_singular AS name_singular,
        child_names.name_plural AS child_name_plural,
        places_count_unfiltered.count AS places_count_unfiltered,
        places_count_filtered.count AS places_count_filtered
      FROM 
        places,
        names,
        child_names,
        places_count_unfiltered,
        places_count_filtered
      WHERE 
        places.place_id = '${placeId}'`
  const res = useLiveQuery(sql)
  const loading = res === undefined
  const row = res?.rows?.[0]
  const nameSingular = row?.name_singular ?? 'Place'
  const childNamePlural = row?.child_name_plural ?? 'Places'

  const navData = useMemo(() => {
    const parentArray = [
      'data',
      'projects',
      projectId,
      'subprojects',
      subprojectId,
      ...(placeId ? ['places', placeId] : []),
      'places',
    ]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, row?.id]
    const ownUrl = `/${ownArray.join('/')}`
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      level: 2,
      parentUrl,
      ownArray,
      urlPath,
      ownUrl,
      label: row?.label,
      navs: [
        { id: 'place', label: nameSingular },
        ...(!placeId2 ?
          [
            {
              id: 'places',
              label: buildNavLabel({
                loading,
                isFiltered: placesIsFiltered,
                countFiltered: row?.places_count_filtered ?? 0,
                countUnfiltered: row?.places_count_unfiltered ?? 0,
                namePlural: childNamePlural,
              }),
            },
          ]
        : []),
      ],
    }
  }, [
    projectId,
    subprojectId,
    placeId,
    row?.id,
    row?.label,
    row?.places_count_filtered,
    row?.places_count_unfiltered,
    openNodes,
    nameSingular,
    placeId2,
    loading,
    placesIsFiltered,
    childNamePlural,
  ])

  return { navData, loading }
}
