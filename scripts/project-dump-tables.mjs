// The tables a project consists of, in FK-safe order (parents before children):
// dump-project.mjs builds the dump schema in this order, import-project-dump.mjs
// relies on it for its single-transaction restore. Tables without a project_id
// column are scoped through their parent's rows in the dump schema.
//
// Deliberately excluded:
// - global catalogs (users, accounts, auth_*, messages, user_messages,
//   field_types, widget_types, widgets_for_fields, crs, qcs, exports) — they
//   exist on every installation
// - account-scoped fields (fields with project_id IS NULL) — they belong to
//   the owner's account, not the project
// - *_history tables — derived; the versioning triggers rebuild them on
//   future changes
export const projectTables = [
  { table: 'projects', where: (id) => `project_id = '${id}'` },
  { table: 'project_users', where: (id) => `project_id = '${id}'` },
  { table: 'project_roles', where: (id) => `project_id = '${id}'` },
  { table: 'subprojects', where: (id) => `project_id = '${id}'` },
  { table: 'place_levels', where: (id) => `project_id = '${id}'` },
  { table: 'filtered_views', where: (id) => `project_id = '${id}'` },
  { table: 'units', where: (id) => `project_id = '${id}'` },
  { table: 'lists', where: (id) => `project_id = '${id}'` },
  {
    table: 'list_values',
    where: () => `list_id IN (SELECT list_id FROM ps_dump.lists)`,
  },
  { table: 'taxonomies', where: (id) => `project_id = '${id}'` },
  {
    table: 'taxa',
    where: () => `taxonomy_id IN (SELECT taxonomy_id FROM ps_dump.taxonomies)`,
  },
  {
    table: 'subproject_taxa',
    where: () =>
      `subproject_id IN (SELECT subproject_id FROM ps_dump.subprojects)`,
  },
  {
    table: 'subproject_roles',
    where: () =>
      `subproject_id IN (SELECT subproject_id FROM ps_dump.subprojects)`,
  },
  {
    table: 'goals',
    where: () =>
      `subproject_id IN (SELECT subproject_id FROM ps_dump.subprojects)`,
  },
  {
    table: 'goal_reports',
    where: () => `goal_id IN (SELECT goal_id FROM ps_dump.goals)`,
  },
  {
    table: 'places',
    where: () =>
      `subproject_id IN (SELECT subproject_id FROM ps_dump.subprojects)`,
  },
  {
    table: 'place_roles',
    where: () => `place_id IN (SELECT place_id FROM ps_dump.places)`,
  },
  {
    table: 'actions',
    where: () => `place_id IN (SELECT place_id FROM ps_dump.places)`,
  },
  {
    table: 'action_quantities',
    where: () => `action_id IN (SELECT action_id FROM ps_dump.actions)`,
  },
  {
    table: 'action_taxa',
    where: () => `action_id IN (SELECT action_id FROM ps_dump.actions)`,
  },
  {
    table: 'checks',
    where: () => `place_id IN (SELECT place_id FROM ps_dump.places)`,
  },
  {
    table: 'check_quantities',
    where: () => `check_id IN (SELECT check_id FROM ps_dump.checks)`,
  },
  {
    table: 'check_taxa',
    where: () => `check_id IN (SELECT check_id FROM ps_dump.checks)`,
  },
  {
    table: 'check_reports',
    where: () => `place_id IN (SELECT place_id FROM ps_dump.places)`,
  },
  {
    table: 'check_report_quantities',
    where: () =>
      `place_check_report_id IN (SELECT place_check_report_id FROM ps_dump.check_reports)`,
  },
  {
    table: 'action_reports',
    where: () => `place_id IN (SELECT place_id FROM ps_dump.places)`,
  },
  {
    table: 'action_report_quantities',
    where: () =>
      `place_action_report_id IN (SELECT place_action_report_id FROM ps_dump.action_reports)`,
  },
  {
    table: 'subproject_reports',
    where: () =>
      `subproject_id IN (SELECT subproject_id FROM ps_dump.subprojects)`,
  },
  { table: 'subproject_report_designs', where: (id) => `project_id = '${id}'` },
  { table: 'project_reports', where: (id) => `project_id = '${id}'` },
  { table: 'project_report_designs', where: (id) => `project_id = '${id}'` },
  { table: 'project_report_subdesigns', where: (id) => `project_id = '${id}'` },
  { table: 'files', where: (id) => `project_id = '${id}'` },
  { table: 'fields', where: (id) => `project_id = '${id}'` },
  { table: 'field_sorts', where: (id) => `project_id = '${id}'` },
  {
    table: 'observation_imports',
    where: () =>
      `subproject_id IN (SELECT subproject_id FROM ps_dump.subprojects)`,
  },
  {
    table: 'observations',
    where: () =>
      `observation_import_id IN (SELECT observation_import_id FROM ps_dump.observation_imports)`,
  },
  { table: 'wms_services', where: (id) => `project_id = '${id}'` },
  {
    table: 'wms_service_layers',
    where: () => `wms_service_id IN (SELECT wms_service_id FROM ps_dump.wms_services)`,
  },
  { table: 'wms_layers', where: (id) => `project_id = '${id}'` },
  { table: 'wfs_services', where: (id) => `project_id = '${id}'` },
  {
    table: 'wfs_service_layers',
    where: () => `wfs_service_id IN (SELECT wfs_service_id FROM ps_dump.wfs_services)`,
  },
  { table: 'vector_layers', where: (id) => `project_id = '${id}'` },
  {
    table: 'vector_layer_geoms',
    where: () =>
      `vector_layer_id IN (SELECT vector_layer_id FROM ps_dump.vector_layers)`,
  },
  {
    table: 'vector_layer_displays',
    where: () =>
      `vector_layer_id IN (SELECT vector_layer_id FROM ps_dump.vector_layers)`,
  },
  { table: 'layer_presentations', where: (id) => `project_id = '${id}'` },
  { table: 'charts', where: (id) => `project_id = '${id}'` },
  {
    table: 'chart_subjects',
    where: () => `chart_id IN (SELECT chart_id FROM ps_dump.charts)`,
  },
  { table: 'project_crs', where: (id) => `project_id = '${id}'` },
  { table: 'qc_assignments', where: (id) => `project_id = '${id}'` },
  { table: 'project_qcs', where: (id) => `project_id = '${id}'` },
  { table: 'project_qc_assignments', where: (id) => `project_id = '${id}'` },
  { table: 'export_assignments', where: (id) => `project_id = '${id}'` },
  { table: 'project_exports', where: (id) => `project_id = '${id}'` },
  { table: 'project_export_assignments', where: (id) => `project_id = '${id}'` },
]
