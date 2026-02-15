import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { isEqual } from 'es-toolkit'

import {
  places1FilterAtom,
  subprojectReportsFilterAtom,
  goalsFilterAtom,
  filesFilterAtom,
  treeOpenNodesAtom,
} from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { validateIds } from './validateIds.ts'

type Props = {
  projectId: string
  subprojectId: string
}

type NavData = {
  id: string
  label: string | null
  name_singular?: string | null
  places_count_filtered?: number | null
  places_count_unfiltered?: number | null
  place_name_plural?: string | null
  subproject_reports_count_filtered?: number | null
  subproject_reports_count_unfiltered?: number | null
  subproject_histories_count?: number | null
  goals_count_filtered?: number | null
  goals_count_unfiltered?: number | null
  occurrence_imports_count?: number | null
  occurrences_to_assess_count?: number | null
  occurrences_not_to_assign_count?: number | null
  subproject_taxa_count?: number | null
  subproject_users_count?: number | null
  files_count_filtered?: number | null
  files_count_unfiltered?: number | null
  charts_count?: number | null
  subproject_report_designs_count?: number | null
}

export const useSubprojectNavData = ({ projectId, subprojectId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [placesFilter] = useAtom(places1FilterAtom)
  
  // Validate after hooks to comply with Rules of Hooks
  validateIds({ projectId, subprojectId })
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

  const sql = `
      WITH 
        places_count_unfiltered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id IS NULL),
        places_count_filtered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id IS NULL ${placesIsFiltered ? ` AND ${placesFilterString}` : ''} ),
        place_name_plural AS (SELECT name_plural FROM place_levels WHERE project_id = '${projectId}' AND level = 1),
        subproject_reports_count_unfiltered AS (SELECT count(*) FROM subproject_reports WHERE subproject_id = '${subprojectId}'),
        subproject_reports_count_filtered AS (SELECT count(*) FROM subproject_reports WHERE subproject_id = '${subprojectId}' ${subprojectReportsIsFiltered ? ` AND ${subprojectReportsFilterString}` : ''}),
        subproject_histories_count AS (SELECT count(*) FROM subproject_histories WHERE subproject_id = '${subprojectId}'),
        goals_count_unfiltered AS (SELECT count(*) FROM goals WHERE subproject_id = '${subprojectId}'),
        goals_count_filtered AS (SELECT count(*) FROM goals WHERE subproject_id = '${subprojectId}' ${goalsIsFiltered ? ` AND ${goalsFilterString}` : ''}),
        occurrence_imports_count AS (SELECT count(*) FROM occurrence_imports WHERE subproject_id = '${subprojectId}'),
        occurrences_to_assess_count AS (SELECT count(*) FROM occurrences o INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id WHERE oi.subproject_id = '${subprojectId}' AND o.not_to_assign IS NOT TRUE AND o.place_id IS NULL),
        occurrences_not_to_assign_count AS (SELECT count(*) FROM occurrences o INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id WHERE oi.subproject_id = '${subprojectId}' AND o.not_to_assign IS TRUE AND o.place_id IS NULL),
        subproject_taxa_count AS (SELECT count(*) FROM subproject_taxa WHERE subproject_id = '${subprojectId}'),
        subproject_users_count AS (SELECT count(*) FROM subproject_users WHERE subproject_id = '${subprojectId}'),
        files_count_unfiltered AS (SELECT count(*) FROM files WHERE subproject_id = '${subprojectId}'),
        files_count_filtered AS (SELECT count(*) FROM files WHERE subproject_id = '${subprojectId}' ${filesIsFiltered ? ` AND ${filesFilterString}` : ''}),
        charts_count AS (SELECT count(*) FROM charts WHERE subproject_id = '${subprojectId}'),
        subproject_report_designs_count AS (SELECT count(*) FROM subproject_report_designs WHERE subproject_id = '${subprojectId}')
      SELECT
        sp.subproject_id AS id,
        sp.label, 
        p.subproject_name_singular AS name_singular,
        places_count_unfiltered.count AS places_count_unfiltered,
        places_count_filtered.count AS places_count_filtered,
        place_name_plural.name_plural AS place_name_plural,
        subproject_reports_count_unfiltered.count AS subproject_reports_count_unfiltered,
        subproject_reports_count_filtered.count AS subproject_reports_count_filtered,
        subproject_histories_count.count AS subproject_histories_count,
        goals_count_unfiltered.count AS goals_count_unfiltered,
        goals_count_filtered.count AS goals_count_filtered,
        occurrence_imports_count.count AS occurrence_imports_count,
        occurrences_to_assess_count.count AS occurrences_to_assess_count,
        occurrences_not_to_assign_count.count AS occurrences_not_to_assign_count,
        subproject_taxa_count.count AS subproject_taxa_count,
        subproject_users_count.count AS subproject_users_count,
        files_count_unfiltered.count AS files_count_unfiltered,
        files_count_filtered.count AS files_count_filtered,
        charts_count.count AS charts_count,
        subproject_report_designs_count.count AS subproject_report_designs_count
      FROM 
        subprojects sp
        INNER JOIN projects p ON p.project_id = sp.project_id, 
        places_count_unfiltered, 
        places_count_filtered,
        place_name_plural,
        subproject_reports_count_unfiltered,
        subproject_reports_count_filtered,
        subproject_histories_count,
        goals_count_unfiltered,
        goals_count_filtered,
        occurrence_imports_count,
        occurrences_to_assess_count,
        occurrences_not_to_assign_count,
        subproject_taxa_count,
        subproject_users_count,
        files_count_unfiltered,
        files_count_filtered,
        charts_count,
        subproject_report_designs_count
      WHERE sp.subproject_id = '${subprojectId}'`

  const res = useLiveQuery(sql)
  const loading = res === undefined
  const nav: NavData | undefined = res?.rows?.[0]

  const subprojectNameSingular = nav?.name_singular ?? 'Subproject'

  const parentArray = ['data', 'projects', projectId, 'subprojects']
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav?.id]
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !loading && !nav
  const label = notFound ? 'Not Found' : (nav?.label ?? nav?.id)

  const navData = {
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
        id: 'designs',
        label: buildNavLabel({
          loading,
          countFiltered: nav?.subproject_report_designs_count ?? 0,
          namePlural: 'Report Designs',
        }),
      },
      {
        id: 'histories',
        label: buildNavLabel({
          loading,
          countFiltered: nav?.subproject_histories_count ?? 0,
          namePlural: 'Histories',
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

  return { navData, loading }
}
