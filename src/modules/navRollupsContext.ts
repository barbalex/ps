import { createContext, useContext } from 'react'

/**
 * Context contract for the shared nav-data rollups. The queries live in
 * NavDataProvider (components/NavDataProvider.tsx), which must be mounted
 * (LayoutProtected does) wherever the nav-data hooks run.
 */

export type NavCountPair = { count: number; filtered: number }

export type ProjectCountKey =
  | 'subprojects'
  | 'project_reports'
  | 'wms_layers'
  | 'vector_layers'
  | 'wms_services'
  | 'wfs_services'
  | 'charts'
  | 'subproject_charts'
  | 'project_users'
  | 'lists'
  | 'taxonomies'
  | 'units'
  | 'project_crs'
  | 'project_qcs'
  | 'project_exports'
  | 'place_levels'
  | 'fields'
  | 'subproject_report_designs'
  | 'project_report_designs'
  | 'table_views'
  | 'files'

export type SubprojectCountKey =
  | 'places'
  | 'subproject_reports'
  | 'goals'
  | 'observation_imports'
  | 'observations_to_assess'
  | 'observations_not_to_assign'
  | 'subproject_taxa'
  | 'subproject_roles'
  | 'charts_own'
  | 'files'

export type NavProjectRow = {
  project_id: string
  label: string | null
  type: string | null
  places_order_by: unknown
  wms_layers: boolean | null
  vector_layers: boolean | null
  project_reports: boolean | null
  subproject_reports: boolean | null
  goals: boolean | null
  occurrences: boolean | null
  taxa: boolean | null
  charts: boolean | null
  files_active_projects: boolean | null
  project_files_in_project: boolean | null
  project_users_in_project: boolean | null
  units_in_project: boolean | null
  fields_in_project: boolean | null
  subproject_taxa_in_subproject: boolean | null
  subproject_roles_in_subproject: boolean | null
  subproject_reports_in_subproject: boolean | null
  files_active_subprojects: boolean | null
  subproject_files_in_subproject: boolean | null
  subproject_name_singular_current: string | null
  subproject_name_plural_current: string | null
}

export type NavPlaceLevelRow = {
  name_singular_de: string | null
  name_plural_de: string | null
  name_singular_en: string | null
  name_plural_en: string | null
  name_singular_fr: string | null
  name_plural_fr: string | null
  name_singular_it: string | null
  name_plural_it: string | null
  check_quantities: boolean | null
  check_quantities_in_check: boolean | null
  check_taxa: boolean | null
  check_taxa_in_check: boolean | null
  check_files: boolean | null
  check_files_in_check: boolean | null
}

export type NavTableViewRow = {
  table_view_id: string
  name_singular_de: string | null
  name_singular_en: string | null
  name_singular_fr: string | null
  name_singular_it: string | null
}

export type QcExportCounts = { assignments: number; run: number }

export type NavRollups = {
  /** true while any rollup query has not resolved yet */
  loading: boolean
  projectRow: (projectId: string) => NavProjectRow | undefined
  projectCount: (
    projectId: string,
    key: ProjectCountKey,
  ) => NavCountPair | undefined
  subprojectCount: (
    subprojectId: string,
    key: SubprojectCountKey,
  ) => NavCountPair | undefined
  placeLevel: (projectId: string, level: number) => NavPlaceLevelRow | undefined
  tableViews: (projectId: string) => NavTableViewRow[]
  projectQcCounts: (projectId: string) => QcExportCounts
  subprojectQcCounts: (subprojectId: string) => QcExportCounts
  projectExportCounts: (projectId: string) => QcExportCounts
  subprojectExportCounts: (subprojectId: string) => QcExportCounts
}

export const NavRollupsContext = createContext<NavRollups | undefined>(
  undefined,
)

export const useNavRollups = (): NavRollups => {
  const rollups = useContext(NavRollupsContext)
  if (!rollups) {
    throw new Error(
      'useNavRollups must be used within NavDataProvider (mounted in LayoutProtected)',
    )
  }
  return rollups
}
