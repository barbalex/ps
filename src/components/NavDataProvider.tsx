import { useMemo, type ReactNode } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'

import {
  subprojectsFilterAtom,
  projectReportsFilterAtom,
  wmsLayersFilterAtom,
  vectorLayersFilterAtom,
  filesFilterAtom,
  listsFilterAtom,
  unitsFilterAtom,
  fieldsFilterAtom,
  places1FilterAtom,
  subprojectReportsFilterAtom,
  goalsFilterAtom,
  languageAtom,
} from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'
import {
  subprojectNameSingularExpr,
  subprojectNamePluralExpr,
} from '../modules/subprojectNameCols.ts'
import {
  NavRollupsContext,
  type NavProjectRow,
  type NavPlaceLevelRow,
  type NavTableViewRow,
  type NavCountPair,
  type ProjectCountKey,
  type SubprojectCountKey,
  type NavRollups,
} from '../modules/navRollupsContext.ts'

/**
 * Shared rollups for the tree's nav-data hooks.
 *
 * Before this provider, every open tree row ran its own navData hook and every
 * hook instance issued its own battery of `count(*)` CTEs filtered to its own
 * id (18-35 per project node, ~19 per subproject node) plus identical
 * sibling queries (the projects row, place_levels, table_views). N open nodes
 * meant N × ~20 separate live queries, each re-running on writes to any table
 * it touched.
 *
 * This provider runs each count once for ALL rows instead:
 * - one tagged-union query per group key (`GROUP BY project_id`,
 *   `GROUP BY subproject_id`) with `count(*) FILTER` for the filtered
 *   variants, so one scan feeds every node
 * - one composite-grouped query (`GROUP BY project_id, subproject_id`) per
 *   table that is counted at BOTH levels (files, qc and export assignments):
 *   rows with a NULL subproject_id carry the project-level counts, rows with
 *   one carry the subproject-level counts
 * - shared lookups for the projects row, place_levels and table_views that
 *   every sibling used to query separately
 *
 * Nav hooks read these maps through useNavRollups() from
 * modules/navRollupsContext.ts; their own live queries shrink to the data
 * that is inherently per-node (a node's own row, its children list).
 */

// one UNION arm per counted table: count filtered by countCondition (the
// unfiltered count narrows to the same base condition) and, separately, by
// the table's global tree filter
const projectArm = (
  key: ProjectCountKey,
  table: string,
  countCondition = 'TRUE',
  filterCondition = 'TRUE',
) => `
    SELECT '${key}' AS key, project_id,
      count(*) FILTER (WHERE ${countCondition})::int AS cnt,
      count(*) FILTER (WHERE (${countCondition}) AND (${filterCondition}))::int AS cnt_filtered
    FROM ${table}
    GROUP BY project_id`

const subprojectArm = (
  key: SubprojectCountKey,
  table: string,
  countCondition = 'TRUE',
  filterCondition = 'TRUE',
) => `
    SELECT '${key}' AS key, subproject_id,
      count(*) FILTER (WHERE ${countCondition})::int AS cnt,
      count(*) FILTER (WHERE (${countCondition}) AND (${filterCondition}))::int AS cnt_filtered
    FROM ${table}
    GROUP BY subproject_id`

export const NavDataProvider = ({ children }: { children: ReactNode }) => {
  const [language] = useAtom(languageAtom)

  const [subprojectsFilter] = useAtom(subprojectsFilterAtom)
  const subprojectsFilterString = filterStringFromFilter(subprojectsFilter)
  const [projectReportsFilter] = useAtom(projectReportsFilterAtom)
  const projectReportsFilterString =
    filterStringFromFilter(projectReportsFilter)
  const [wmsLayersFilter] = useAtom(wmsLayersFilterAtom)
  const wmsLayersFilterString = filterStringFromFilter(wmsLayersFilter)
  const [vectorLayersFilter] = useAtom(vectorLayersFilterAtom)
  const vectorLayersFilterString = filterStringFromFilter(vectorLayersFilter)
  const [filesFilter] = useAtom(filesFilterAtom)
  const filesFilterString = filterStringFromFilter(filesFilter)
  const [listsFilter] = useAtom(listsFilterAtom)
  const listsFilterString = filterStringFromFilter(listsFilter)
  const [unitsFilter] = useAtom(unitsFilterAtom)
  const unitsFilterString = filterStringFromFilter(unitsFilter)
  const [fieldsFilter] = useAtom(fieldsFilterAtom)
  const fieldsFilterString = filterStringFromFilter(fieldsFilter)
  const [placesFilter] = useAtom(places1FilterAtom)
  const placesFilterString = filterStringFromFilter(placesFilter, '')
  const [subprojectReportsFilter] = useAtom(subprojectReportsFilterAtom)
  const subprojectReportsFilterString = filterStringFromFilter(
    subprojectReportsFilter,
    '',
  )
  const [goalsFilter] = useAtom(goalsFilterAtom)
  const goalsFilterString = filterStringFromFilter(goalsFilter, '')

  const resProjects = useLiveQuery<NavProjectRow>(`
    SELECT project_id, label, type, places_order_by,
      wms_layers, vector_layers, project_reports, subproject_reports, goals,
      occurrences, taxa, charts, files_active_projects,
      project_files_in_project, project_users_in_project, units_in_project,
      fields_in_project, subproject_taxa_in_subproject,
      subproject_roles_in_subproject, subproject_reports_in_subproject,
      files_active_subprojects, subproject_files_in_subproject,
      ${subprojectNameSingularExpr(language)} AS subproject_name_singular_current,
      ${subprojectNamePluralExpr(language)} AS subproject_name_plural_current
    FROM projects
  `)

  const resProjectCounts = useLiveQuery<{
    key: ProjectCountKey
    project_id: string
    cnt: number
    cnt_filtered: number
  }>(
    [
      projectArm(
        'subprojects',
        'subprojects',
        'TRUE',
        subprojectsFilterString || 'TRUE',
      ),
      projectArm(
        'project_reports',
        'project_reports',
        'TRUE',
        projectReportsFilterString || 'TRUE',
      ),
      projectArm(
        'wms_layers',
        'wms_layers',
        'TRUE',
        wmsLayersFilterString || 'TRUE',
      ),
      projectArm(
        'vector_layers',
        'vector_layers',
        'TRUE',
        vectorLayersFilterString || 'TRUE',
      ),
      projectArm('wms_services', 'wms_services'),
      projectArm('wfs_services', 'wfs_services'),
      projectArm('charts', 'charts', 'NOT for_subprojects'),
      projectArm(
        'subproject_charts',
        'charts',
        'for_subprojects AND subproject_id IS NULL',
      ),
      projectArm('project_users', 'project_users'),
      projectArm('lists', 'lists', 'TRUE', listsFilterString || 'TRUE'),
      projectArm('taxonomies', 'taxonomies'),
      projectArm('units', 'units', 'TRUE', unitsFilterString || 'TRUE'),
      projectArm('project_crs', 'project_crs'),
      projectArm('project_qcs', 'project_qcs'),
      projectArm('project_exports', 'project_exports'),
      projectArm('place_levels', 'place_levels'),
      projectArm('fields', 'fields', 'TRUE', fieldsFilterString || 'TRUE'),
      projectArm('subproject_report_designs', 'subproject_report_designs'),
      projectArm('project_report_designs', 'project_report_designs'),
      projectArm('table_views', 'table_views'),
    ].join(' UNION ALL'),
  )

  const resSubprojectCounts = useLiveQuery<{
    key: SubprojectCountKey
    subproject_id: string
    cnt: number
    cnt_filtered: number
  }>(
    [
      // level-1 places only: a subproject's direct children
      subprojectArm(
        'places',
        'places',
        'parent_id IS NULL',
        placesFilterString || 'TRUE',
      ),
      subprojectArm(
        'subproject_reports',
        'subproject_reports',
        'TRUE',
        subprojectReportsFilterString || 'TRUE',
      ),
      subprojectArm('goals', 'goals', 'TRUE', goalsFilterString || 'TRUE'),
      subprojectArm('observation_imports', 'observation_imports'),
      subprojectArm('subproject_taxa', 'subproject_taxa'),
      subprojectArm('subproject_roles', 'subproject_roles'),
      // own charts; the project's chart templates are added on top in JS
      subprojectArm('charts_own', 'charts'),
    ].join(' UNION ALL'),
  )

  // observations counted per importing subproject, split by assessment state
  const resObservationsCounts = useLiveQuery<{
    subproject_id: string
    to_assess: number
    not_to_assign: number
  }>(`
    SELECT oi.subproject_id,
      count(*) FILTER (WHERE o.not_to_assign IS NOT TRUE AND o.place_id IS NULL)::int AS to_assess,
      count(*) FILTER (WHERE o.not_to_assign IS TRUE AND o.place_id IS NULL)::int AS not_to_assign
    FROM observations o
    INNER JOIN observation_imports oi ON o.observation_import_id = oi.observation_import_id
    GROUP BY oi.subproject_id
  `)

  // files counted at both levels in one scan: "directly attached" means the
  // more specific id columns are NULL (see filesScopeWhere). Rows with a NULL
  // subproject_id carry the project-level counts, rows with one the
  // subproject-level counts.
  const directFiles =
    'subproject_id IS NULL AND place_id IS NULL AND action_id IS NULL AND check_id IS NULL'
  const directSubprojectFiles =
    'subproject_id IS NOT NULL AND place_id IS NULL AND action_id IS NULL AND check_id IS NULL'
  const resFilesCounts = useLiveQuery<{
    project_id: string
    subproject_id: string | null
    project_cnt: number
    project_cnt_filtered: number
    subproject_cnt: number
    subproject_cnt_filtered: number
  }>(`
    SELECT project_id, subproject_id,
      count(*) FILTER (WHERE ${directFiles})::int AS project_cnt,
      count(*) FILTER (WHERE (${directFiles}) AND (${filesFilterString || 'TRUE'}))::int AS project_cnt_filtered,
      count(*) FILTER (WHERE ${directSubprojectFiles})::int AS subproject_cnt,
      count(*) FILTER (WHERE (${directSubprojectFiles}) AND (${filesFilterString || 'TRUE'}))::int AS subproject_cnt_filtered
    FROM files
    GROUP BY project_id, subproject_id
  `)

  // qc assignments counted at both levels in one scan: the run count comes
  // from the run tables alone; the assignments count additionally includes
  // the project-level template assignments (composed in JS below)
  const resQcCounts = useLiveQuery<{
    project_id: string
    subproject_id: string | null
    project_cnt: number
    subproject_cnt: number
  }>(`
    SELECT qa.project_id, qa.subproject_id,
      count(*) FILTER (WHERE q.level = 'project')::int AS project_cnt,
      count(*) FILTER (WHERE q.level = 'subproject')::int AS subproject_cnt
    FROM qc_assignments qa
    INNER JOIN qcs q ON q.qcs_id = qa.qc_id
    GROUP BY qa.project_id, qa.subproject_id
  `)

  const resProjectQcCounts = useLiveQuery<{
    project_id: string
    subproject_id: string | null
    cnt: number
  }>(`
    SELECT project_id, subproject_id, count(*)::int AS cnt
    FROM project_qc_assignments
    GROUP BY project_id, subproject_id
  `)

  const resExportCounts = useLiveQuery<{
    project_id: string
    subproject_id: string | null
    project_cnt: number
    subproject_cnt: number
  }>(`
    SELECT ea.project_id, ea.subproject_id,
      count(*) FILTER (WHERE e.level = 'project')::int AS project_cnt,
      count(*) FILTER (WHERE e.level = 'subproject')::int AS subproject_cnt
    FROM export_assignments ea
    INNER JOIN exports e ON e.exports_id = ea.exports_id
    GROUP BY ea.project_id, ea.subproject_id
  `)

  const resProjectExportCounts = useLiveQuery<{
    project_id: string
    subproject_id: string | null
    cnt: number
  }>(`
    SELECT project_id, subproject_id, count(*)::int AS cnt
    FROM project_export_assignments
    GROUP BY project_id, subproject_id
  `)

  const resPlaceLevels = useLiveQuery<
    NavPlaceLevelRow & {
      project_id: string
      level: number
    }
  >(`
    SELECT project_id, level,
      name_singular_de, name_plural_de, name_singular_en, name_plural_en,
      name_singular_fr, name_plural_fr, name_singular_it, name_plural_it,
      check_quantities, check_quantities_in_check, check_taxa,
      check_taxa_in_check, check_files, check_files_in_check
    FROM place_levels
  `)

  const resTableViews = useLiveQuery<
    NavTableViewRow & {
      project_id: string
    }
  >(`
    SELECT table_view_id, project_id,
      name_singular_de, name_singular_en, name_singular_fr, name_singular_it
    FROM table_views
    WHERE table_name = 'subprojects'
    ORDER BY sort, label
  `)

  const projectRowsById = useMemo(() => {
    const map = new Map<string, NavProjectRow>()
    for (const row of resProjects?.rows ?? []) map.set(row.project_id, row)
    return map
  }, [resProjects])

  const projectCounts = useMemo(() => {
    const map: Record<
      string,
      Partial<Record<ProjectCountKey, NavCountPair>>
    > = {}
    for (const r of resProjectCounts?.rows ?? []) {
      map[r.project_id] ??= {}
      map[r.project_id]![r.key] = { count: r.cnt, filtered: r.cnt_filtered }
    }
    for (const r of resFilesCounts?.rows ?? []) {
      if (r.subproject_id !== null) continue
      map[r.project_id] ??= {}
      map[r.project_id]!.files = {
        count: r.project_cnt,
        filtered: r.project_cnt_filtered,
      }
    }
    return map
  }, [resProjectCounts, resFilesCounts])

  const subprojectCounts = useMemo(() => {
    const map: Record<
      string,
      Partial<Record<SubprojectCountKey, NavCountPair>>
    > = {}
    for (const r of resSubprojectCounts?.rows ?? []) {
      map[r.subproject_id] ??= {}
      map[r.subproject_id]![r.key] = { count: r.cnt, filtered: r.cnt_filtered }
    }
    for (const r of resObservationsCounts?.rows ?? []) {
      map[r.subproject_id] ??= {}
      map[r.subproject_id]!.observations_to_assess = {
        count: r.to_assess,
        filtered: r.to_assess,
      }
      map[r.subproject_id]!.observations_not_to_assign = {
        count: r.not_to_assign,
        filtered: r.not_to_assign,
      }
    }
    for (const r of resFilesCounts?.rows ?? []) {
      if (r.subproject_id === null) continue
      map[r.subproject_id] ??= {}
      map[r.subproject_id]!.files = {
        count: r.subproject_cnt,
        filtered: r.subproject_cnt_filtered,
      }
    }
    return map
  }, [resSubprojectCounts, resObservationsCounts, resFilesCounts])

  // qc run counts keyed by level; template assignments counted separately
  const qcByProject = useMemo(() => {
    const map: Record<string, number> = {}
    for (const r of resQcCounts?.rows ?? []) {
      if (r.subproject_id === null && r.project_cnt)
        map[r.project_id] = r.project_cnt
    }
    return map
  }, [resQcCounts])

  const qcBySubproject = useMemo(() => {
    const map: Record<string, number> = {}
    for (const r of resQcCounts?.rows ?? []) {
      if (r.subproject_id !== null && r.subproject_cnt)
        map[r.subproject_id] = r.subproject_cnt
    }
    return map
  }, [resQcCounts])

  const projectQcByProject = useMemo(() => {
    const map: Record<string, number> = {}
    for (const r of resProjectQcCounts?.rows ?? []) {
      if (r.subproject_id === null) map[r.project_id] = r.cnt
    }
    return map
  }, [resProjectQcCounts])

  const projectQcBySubproject = useMemo(() => {
    const map: Record<string, number> = {}
    for (const r of resProjectQcCounts?.rows ?? []) {
      if (r.subproject_id !== null) map[r.subproject_id] = r.cnt
    }
    return map
  }, [resProjectQcCounts])

  const exportByProject = useMemo(() => {
    const map: Record<string, number> = {}
    for (const r of resExportCounts?.rows ?? []) {
      if (r.subproject_id === null && r.project_cnt)
        map[r.project_id] = r.project_cnt
    }
    return map
  }, [resExportCounts])

  const exportBySubproject = useMemo(() => {
    const map: Record<string, number> = {}
    for (const r of resExportCounts?.rows ?? []) {
      if (r.subproject_id !== null && r.subproject_cnt)
        map[r.subproject_id] = r.subproject_cnt
    }
    return map
  }, [resExportCounts])

  const projectExportByProject = useMemo(() => {
    const map: Record<string, number> = {}
    for (const r of resProjectExportCounts?.rows ?? []) {
      if (r.subproject_id === null) map[r.project_id] = r.cnt
    }
    return map
  }, [resProjectExportCounts])

  const projectExportBySubproject = useMemo(() => {
    const map: Record<string, number> = {}
    for (const r of resProjectExportCounts?.rows ?? []) {
      if (r.subproject_id !== null) map[r.subproject_id] = r.cnt
    }
    return map
  }, [resProjectExportCounts])

  const placeLevelsByKey = useMemo(() => {
    const map = new Map<string, NavPlaceLevelRow>()
    for (const row of resPlaceLevels?.rows ?? []) {
      const { project_id, level, ...names } = row
      map.set(`${project_id}__${level}`, names)
    }
    return map
  }, [resPlaceLevels])

  const tableViewsByProject = useMemo(() => {
    const map = new Map<string, NavTableViewRow[]>()
    for (const row of resTableViews?.rows ?? []) {
      const { project_id, ...view } = row
      const list = map.get(project_id)
      if (list) list.push(view)
      else map.set(project_id, [view])
    }
    return map
  }, [resTableViews])

  const loading =
    resProjects === undefined ||
    resProjectCounts === undefined ||
    resSubprojectCounts === undefined ||
    resObservationsCounts === undefined ||
    resFilesCounts === undefined ||
    resQcCounts === undefined ||
    resProjectQcCounts === undefined ||
    resExportCounts === undefined ||
    resProjectExportCounts === undefined ||
    resPlaceLevels === undefined ||
    resTableViews === undefined

  const value: NavRollups = {
    loading,
    projectRow: (projectId) => projectRowsById.get(projectId),
    projectCount: (projectId, key) => projectCounts[projectId]?.[key],
    subprojectCount: (subprojectId, key) =>
      subprojectCounts[subprojectId]?.[key],
    placeLevel: (projectId, level) =>
      placeLevelsByKey.get(`${projectId}__${level}`),
    tableViews: (projectId) => tableViewsByProject.get(projectId) ?? [],
    projectQcCounts: (projectId) => ({
      run: qcByProject[projectId] ?? 0,
      assignments:
        (qcByProject[projectId] ?? 0) + (projectQcByProject[projectId] ?? 0),
    }),
    subprojectQcCounts: (subprojectId) => ({
      run: qcBySubproject[subprojectId] ?? 0,
      assignments:
        (qcBySubproject[subprojectId] ?? 0) +
        (projectQcBySubproject[subprojectId] ?? 0),
    }),
    projectExportCounts: (projectId) => ({
      run: exportByProject[projectId] ?? 0,
      assignments:
        (exportByProject[projectId] ?? 0) +
        (projectExportByProject[projectId] ?? 0),
    }),
    subprojectExportCounts: (subprojectId) => ({
      run: exportBySubproject[subprojectId] ?? 0,
      assignments:
        (exportBySubproject[subprojectId] ?? 0) +
        (projectExportBySubproject[subprojectId] ?? 0),
    }),
  }

  return (
    <NavRollupsContext.Provider value={value}>
      {children}
    </NavRollupsContext.Provider>
  )
}
