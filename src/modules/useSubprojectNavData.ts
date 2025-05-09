import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import isEqual from 'lodash/isEqual'

import {
  places1FilterAtom,
  subprojectReportsFilterAtom,
  goalsFilterAtom,
  filesFilterAtom,
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

  const [filesFilter] = useAtom(filesFilterAtom)
  const filesFilterString = filterStringFromFilter(filesFilter)
  const filesIsFiltered = !!filesFilterString

  const res = useLiveQuery(
    `
      WITH 
        places_count_unfiltered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id IS NULL),
        places_count_filtered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id IS NULL ${placesIsFiltered ? ` AND ${placesFilterString}` : ''} ),
        place_name_plural AS (SELECT name_plural FROM place_levels WHERE project_id = '${projectId}' AND level = 1),
        subproject_reports_count_unfiltered AS (SELECT count(*) FROM subproject_reports WHERE subproject_id = '${subprojectId}'),
        subproject_reports_count_filtered AS (SELECT count(*) FROM subproject_reports WHERE subproject_id = '${subprojectId}' ${subprojectReportsIsFiltered ? ` AND ${subprojectReportsFilterString}` : ''}),
        goals_count_unfiltered AS (SELECT count(*) FROM goals WHERE subproject_id = '${subprojectId}'),
        goals_count_filtered AS (SELECT count(*) FROM goals WHERE subproject_id = '${subprojectId}' ${goalsIsFiltered ? ` AND ${goalsFilterString}` : ''}),
        occurrence_imports_count AS (SELECT count(*) FROM occurrence_imports WHERE subproject_id = '${subprojectId}'),
        occurrences_to_assess_count AS (SELECT count(*) FROM occurrences o INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id WHERE oi.subproject_id = '${subprojectId}' AND o.not_to_assign IS NOT TRUE AND o.place_id IS NULL),
        occurrences_not_to_assign_count AS (SELECT count(*) FROM occurrences o INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id WHERE oi.subproject_id = '${subprojectId}' AND o.not_to_assign IS TRUE AND o.place_id IS NULL),
        subproject_taxa_count AS (SELECT count(*) FROM subproject_taxa WHERE subproject_id = '${subprojectId}'),
        subproject_users_count AS (SELECT count(*) FROM subproject_users WHERE subproject_id = '${subprojectId}'),
        files_count_unfiltered AS (SELECT count(*) FROM files WHERE subproject_id = '${subprojectId}'),
        files_count_filtered AS (SELECT count(*) FROM files WHERE subproject_id = '${subprojectId}' ${filesIsFiltered ? ` AND ${filesFilterString}` : ''}),
        charts_count AS (SELECT count(*) FROM charts WHERE subproject_id = '${subprojectId}')
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
        goals_count_filtered.count AS goals_count_filtered,
        occurrence_imports_count.count AS occurrence_imports_count,
        occurrences_to_assess_count.count AS occurrences_to_assess_count,
        occurrences_not_to_assign_count.count AS occurrences_not_to_assign_count,
        subproject_taxa_count.count AS subproject_taxa_count,
        subproject_users_count.count AS subproject_users_count,
        files_count_unfiltered.count AS files_count_unfiltered,
        files_count_filtered.count AS files_count_filtered,
        charts_count.count AS charts_count
      FROM 
        subprojects sp
        INNER JOIN projects p ON p.project_id = sp.project_id, 
        places_count_unfiltered, 
        places_count_filtered,
        place_name_plural,
        subproject_reports_count_unfiltered,
        subproject_reports_count_filtered,
        goals_count_unfiltered,
        goals_count_filtered,
        occurrence_imports_count,
        occurrences_to_assess_count,
        occurrences_not_to_assign_count,
        subproject_taxa_count,
        subproject_users_count,
        files_count_unfiltered,
        files_count_filtered,
        charts_count
      WHERE sp.subproject_id = '${subprojectId}'`,
  )
  const loading = res === undefined
  const nav = res?.rows?.[0]

  const subprojectNameSingular = nav?.name_singular ?? 'Subproject'

  const navData = useMemo(() => {
    const parentArray = ['data', 'projects', projectId, 'subprojects']
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, nav?.id]
    const ownUrl = `/${ownArray.join('/')}`
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    const notFound = !!res && !nav
    const label = notFound ? 'Not Found' : (nav?.label ?? nav?.id)

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      level: 2,
      parentUrl,
      ownArray,
      urlPath,
      ownUrl,
      label,
      notFound,
      navs: [
        { id: 'subproject', label: subprojectNameSingular },
        {
          id: 'places',
          label: buildNavLabel({
            loading,
            isFiltered: placesIsFiltered,
            countFiltered: nav?.places_count_filtered ?? 0,
            countUnfiltered: nav?.places_count_unfiltered ?? 0,
            namePlural: nav?.place_name_plural ?? 'Places',
          }),
        },
        {
          id: 'reports',
          label: buildNavLabel({
            loading,
            isFiltered: subprojectReportsIsFiltered,
            countFiltered: nav?.subproject_reports_count_filtered ?? 0,
            countUnfiltered: nav?.subproject_reports_count_unfiltered ?? 0,
            namePlural: 'Reports',
          }),
        },
        {
          id: 'goals',
          label: buildNavLabel({
            loading,
            isFiltered: goalsIsFiltered,
            countFiltered: nav?.goals_count_filtered ?? 0,
            countUnfiltered: nav?.goals_count_unfiltered ?? 0,
            namePlural: 'Goals',
          }),
        },
        {
          id: 'occurrence-imports',
          label: buildNavLabel({
            loading,
            countFiltered: nav?.occurrence_imports_count ?? 0,
            namePlural: 'Occurrence Imports',
          }),
        },
        {
          id: 'occurrences-to-assess',
          label: buildNavLabel({
            loading,
            countFiltered: nav?.occurrences_to_assess_count ?? 0,
            namePlural: 'Occurrences To Assess',
          }),
        },
        {
          id: 'occurrences-not-to-assign',
          label: buildNavLabel({
            loading,
            countFiltered: nav?.occurrences_not_to_assign_count ?? 0,
            namePlural: 'Occurrences Not To Assign',
          }),
        },
        {
          id: 'taxa',
          label: buildNavLabel({
            loading,
            countFiltered: nav?.subproject_taxa_count ?? 0,
            namePlural: 'Taxa',
          }),
        },
        {
          id: 'users',
          label: buildNavLabel({
            loading,
            countFiltered: nav?.subproject_users_count ?? 0,
            namePlural: 'Users',
          }),
        },
        {
          id: 'files',
          label: buildNavLabel({
            loading,
            isFiltered: filesIsFiltered,
            countFiltered: nav?.files_count_filtered ?? 0,
            countUnfiltered: nav?.files_count_unfiltered ?? 0,
            namePlural: 'Files',
          }),
        },
        {
          id: 'charts',
          label: buildNavLabel({
            loading,
            countFiltered: nav?.charts_count ?? 0,
            namePlural: 'Charts',
          }),
        },
      ],
    }
  }, [
    projectId,
    nav?.id,
    nav?.label,
    nav?.places_count_filtered,
    nav?.places_count_unfiltered,
    nav?.place_name_plural,
    nav?.subproject_reports_count_filtered,
    nav?.subproject_reports_count_unfiltered,
    nav?.goals_count_filtered,
    nav?.goals_count_unfiltered,
    nav?.occurrence_imports_count,
    nav?.occurrences_to_assess_count,
    nav?.occurrences_not_to_assign_count,
    nav?.subproject_taxa_count,
    nav?.subproject_users_count,
    nav?.files_count_filtered,
    nav?.files_count_unfiltered,
    nav?.charts_count,
    openNodes,
    subprojectNameSingular,
    loading,
    placesIsFiltered,
    subprojectReportsIsFiltered,
    goalsIsFiltered,
    filesIsFiltered,
  ])

  return { navData, loading }
}
