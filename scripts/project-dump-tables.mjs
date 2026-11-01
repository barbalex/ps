// The tables a project consists of, in FK-safe order (parents before children):
// dump-project.mjs builds the dump schema in this order, import-project-dump.mjs
// relies on it for its single-transaction restore, and the in-app export /
// import (src/modules/projectDump/) walks the same list against the local
// database. Tables without a project_id column are scoped through their
// parent's rows (`parent`: the FK column and the parent table).
//
// Deliberately excluded:
// - global catalogs (users, accounts, auth_*, messages, user_messages,
//   field_types, widget_types, widgets_for_fields, crs, qcs, exports) — they
//   exist on every installation
// - account-scoped fields (fields with project_id IS NULL) — they belong to
//   the owner's account, not the project
// - *_history tables — derived; the versioning triggers rebuild them on
//   future changes
const byProject = (table) => ({ table, scope: 'project_id' })
const byParent = (table, column, parentTable) => ({
  table,
  parent: { column, table: parentTable },
})

export const projectTables = [
  byProject('projects'),
  byProject('project_users'),
  byProject('project_roles'),
  byProject('subprojects'),
  byProject('place_levels'),
  byProject('filtered_views'),
  byProject('units'),
  byProject('lists'),
  byParent('list_values', 'list_id', 'lists'),
  byProject('taxonomies'),
  byParent('taxa', 'taxonomy_id', 'taxonomies'),
  byParent('subproject_taxa', 'subproject_id', 'subprojects'),
  byParent('subproject_roles', 'subproject_id', 'subprojects'),
  byParent('goals', 'subproject_id', 'subprojects'),
  byParent('goal_reports', 'goal_id', 'goals'),
  byParent('places', 'subproject_id', 'subprojects'),
  byParent('place_roles', 'place_id', 'places'),
  byParent('actions', 'place_id', 'places'),
  byParent('action_quantities', 'action_id', 'actions'),
  byParent('action_taxa', 'action_id', 'actions'),
  byParent('checks', 'place_id', 'places'),
  byParent('check_quantities', 'check_id', 'checks'),
  byParent('check_taxa', 'check_id', 'checks'),
  byParent('check_reports', 'place_id', 'places'),
  byParent('check_report_quantities', 'place_check_report_id', 'check_reports'),
  byParent('action_reports', 'place_id', 'places'),
  byParent('action_report_quantities', 'place_action_report_id', 'action_reports'),
  byParent('subproject_reports', 'subproject_id', 'subprojects'),
  byProject('subproject_report_designs'),
  byProject('project_reports'),
  byProject('project_report_designs'),
  byProject('project_report_subdesigns'),
  byProject('files'),
  byProject('fields'),
  byProject('field_sorts'),
  byParent('observation_imports', 'subproject_id', 'subprojects'),
  byParent('observations', 'observation_import_id', 'observation_imports'),
  byProject('wms_services'),
  byParent('wms_service_layers', 'wms_service_id', 'wms_services'),
  byProject('wms_layers'),
  byProject('wfs_services'),
  byParent('wfs_service_layers', 'wfs_service_id', 'wfs_services'),
  byProject('vector_layers'),
  byParent('vector_layer_geoms', 'vector_layer_id', 'vector_layers'),
  byParent('vector_layer_displays', 'vector_layer_id', 'vector_layers'),
  byProject('layer_presentations'),
  byProject('charts'),
  byParent('chart_subjects', 'chart_id', 'charts'),
  byProject('project_crs'),
  byProject('qc_assignments'),
  byProject('project_qcs'),
  byProject('project_qc_assignments'),
  byProject('export_assignments'),
  byProject('project_exports'),
  byProject('project_export_assignments'),
]

const entryByTable = new Map(projectTables.map((entry) => [entry.table, entry]))

/**
 * WHERE clause selecting a table's rows of one project.
 * - `schema` given: parents are the already-scoped copies in that schema
 *   (dump-project.mjs: `list_id IN (SELECT list_id FROM ps_dump.lists)`)
 * - no schema: parents are resolved recursively against the live tables
 *   (in-app export: `list_id IN (SELECT list_id FROM lists WHERE project_id = '…')`)
 */
export const projectTableWhere = (table, projectId, schema) => {
  const entry = entryByTable.get(table)
  if (!entry) throw new Error(`projectTableWhere: unknown table ${table}`)
  if (entry.scope) return `${entry.scope} = '${projectId}'`
  const { column, table: parentTable } = entry.parent
  const parentRows =
    schema ?
      `SELECT ${column} FROM ${schema}.${parentTable}`
    : `SELECT ${column} FROM ${parentTable} WHERE ${projectTableWhere(parentTable, projectId)}`
  return `${column} IN (${parentRows})`
}
