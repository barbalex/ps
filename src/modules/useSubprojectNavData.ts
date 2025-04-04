import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import isEqual from 'lodash/isEqual'

import {
  places1FilterAtom,
  subprojectReportsFilterAtom,
  goalsFilterAtom,
  treeOpenNodesAtom,
} from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filterStringFromFilter } from './filterStringFromFilter.ts'

export const useSubprojectNavData = ({ projectId, subprojectId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const [placesFilter] = useAtom(places1FilterAtom)
  const placesFilterString = filterStringFromFilter(placesFilter)
  const placesIsFiltered = !!placesFilterString

  const [subprojectReportsFilter] = useAtom(subprojectReportsFilterAtom)
  const subprojectReportsFilterString = filterStringFromFilter(
    subprojectReportsFilter,
  )
  const subprojectReportsIsFiltered = !!subprojectReportsFilterString

  const [goalsFilter] = useAtom(goalsFilterAtom)
  const goalsFilterString = filterStringFromFilter(goalsFilter)
  const goalsIsFiltered = !!goalsFilterString

  const res = useLiveQuery(
    `
      WITH 
        places_count_unfiltered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id IS NULL),
        places_count_filtered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id IS NULL ${placesIsFiltered ? ` AND ${placesFilterString}` : ''} ),
        place_name_plural AS (SELECT name_plural FROM place_levels WHERE project_id = '${projectId}' AND level = 1),
        subproject_reports_count_unfiltered AS (SELECT count(*) FROM subproject_reports WHERE subproject_id = '${subprojectId}'),
        subproject_reports_count_filtered AS (SELECT count(*) FROM subproject_reports WHERE subproject_id = '${subprojectId}' ${subprojectReportsIsFiltered ? ` AND ${subprojectReportsFilterString}` : ''}),
        goals_count_unfiltered AS (SELECT count(*) FROM goals WHERE subproject_id = '${subprojectId}'),
        goals_count_filtered AS (SELECT count(*) FROM goals WHERE subproject_id = '${subprojectId}' ${goalsIsFiltered ? ` AND ${goalsFilterString}` : ''})
      SELECT
        sp.subproject_id AS id,
        sp.label, 
        p.subproject_name_singular AS name_singular,
        places_count_unfiltered.count AS places_count_unfiltered,
        places_count_filtered.count AS places_count_filtered,
        place_name_plural.name_plural AS place_name_plural,
        subproject_reports_count_unfiltered.count AS subproject_reports_count_unfiltered,
        subproject_reports_count_filtered.count AS subproject_reports_count_filtered,
        goals_count_unfiltered.count AS goals_count_unfiltered,
        goals_count_filtered.count AS goals_count_filtered
      FROM 
        subprojects sp
        INNER JOIN projects p ON p.project_id = sp.project_id, 
        places_count_unfiltered, 
        places_count_filtered,
        place_name_plural,
        subproject_reports_count_unfiltered,
        subproject_reports_count_filtered,
        goals_count_unfiltered,
        goals_count_filtered
      WHERE p.project_id = '${projectId}'`,
  )
  const loading = res === undefined
  const row = res?.rows?.[0]

  const subprojectNameSingular = row?.name_singular ?? 'Subproject'

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
            isFiltered: placesIsFiltered,
            countFiltered: row?.places_count_filtered ?? 0,
            countUnfiltered: row?.places_count_unfiltered ?? 0,
            namePlural: row?.place_name_plural ?? 'Places',
          }),
        },
        {
          id: 'reports',
          label: buildNavLabel({
            loading,
            isFiltered: subprojectReportsIsFiltered,
            countFiltered: row?.subproject_reports_count_filtered ?? 0,
            countUnfiltered: row?.subproject_reports_count_unfiltered ?? 0,
            namePlural: 'Reports',
          }),
        },
        {
          id: 'goals',
          label: buildNavLabel({
            loading,
            isFiltered: goalsIsFiltered,
            countFiltered: row?.goals_count_filtered ?? 0,
            countUnfiltered: row?.goals_count_unfiltered ?? 0,
            namePlural: 'Goals',
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
    row?.subproject_reports_count_filtered,
    row?.subproject_reports_count_unfiltered,
    row?.goals_count_filtered,
    row?.goals_count_unfiltered,
    openNodes,
    subprojectNameSingular,
    loading,
    placesIsFiltered,
    subprojectReportsIsFiltered,
    goalsIsFiltered,
  ])

  return { navData, loading }
}
