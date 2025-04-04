import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import isEqual from 'lodash/isEqual'

import { places1FilterAtom, treeOpenNodesAtom } from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filterStringFromFilter } from './filterStringFromFilter.ts'

export const useSubprojectNavData = ({ projectId, subprojectId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const [placesFilter] = useAtom(places1FilterAtom)
  const placesFilterString = filterStringFromFilter(placesFilter)
  const placesIsFiltered = !!placesFilterString

  const res = useLiveQuery(
    `
      WITH 
        places_count_unfiltered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id IS NULL),
        places_count_filtered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id IS NULL ${placesIsFiltered ? ` AND ${placesFilterString}` : ''} ),
        place_name_plural AS (SELECT name_plural FROM place_levels WHERE project_id = '${projectId}' and level = ${placeId ? 2 : 1})
      SELECT
        sp.subproject_id AS id,
        sp.label, 
        places_count_unfiltered.count AS places_count_unfiltered,
        places_count_filtered.count AS places_count_filtered,
        place_name_plural.name_plural AS place_name_plural
      FROM 
        subprojects sp
        INNER JOIN projects p ON p.project_id = sp.project_id, 
        places_count_unfiltered, 
        places_count_filtered,
        place_name_plural
      WHERE projects.project_id = '${projectId}'`,
  )
  const loading = res === undefined
  const row = res?.rows?.[0]

  const subprojectNameSingular = navs[0]?.name_singular ?? 'Subproject'

  const navData = useMemo(() => {
    const parentArray = ['data', 'projects', projectId, 'subprojects']
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
        { id: 'subproject', label: subprojectNameSingular },
        {
          id: 'places',
          label: buildNavLabel({
            loading,
            isFiltered: placeIsFiltered,
            countFiltered: row?.places_count_filtered ?? 0,
            countUnfiltered: row?.places_count_unfiltered ?? 0,
            namePlural: row?.place_name_plural ?? 'Places',
          }),
        },
      ],
    }
  }, [
    projectId,
    row?.id,
    row?.label,
    row?.places_count_filtered,
    row?.places_count_unfiltered,
    row?.place_name_plural,
    openNodes,
    subprojectNameSingular,
    loading,
  ])

  return { navData, loading }
}
