// Single source of truth for the Electric shapes the client subscribes to.
// Source: backend/auth/shapeDefinitions.mjs — mirrored by `npm run sync-sql`
// to backend-dev/auth/ and src/modules/. The auth server's forward_auth check
// (/auth/electric/check) only lets a shape request through when its table,
// where clause and columns match an entry here and $1 is the caller's own
// user id, so the client cannot widen its own sync scope.
//
// Electric's subquery parser only accepts plain column references (no table
// aliases) and only IN-subqueries (no scalar subqueries).

// Resolves the auth user ($1) to their project directory rows:
// claimed rows (auth_user_id) plus rows matching the auth user's email.
const projectUserIdsOfUser = `(SELECT project_user_id FROM project_users WHERE auth_user_id = $1 OR email IN (SELECT email FROM users WHERE user_id = $1))`
const projectIdsOfUser = `SELECT project_id FROM project_roles WHERE project_user_id IN ${projectUserIdsOfUser}`
// The scope sets nest: a subproject only syncs when its project does, a
// place only when its subproject does. General roles cascade down by
// trigger, so a project reader gets every subproject/place; specific roles
// get exactly what was assigned (see docs user-roles: "users need rights all
// the way up"). The nesting also keeps every child shape within the parent
// shapes it references — pglite enforces the foreign keys locally.
const subprojectIdsOfUser = `SELECT subproject_id FROM subprojects WHERE project_id IN (${projectIdsOfUser}) AND subproject_id IN (SELECT subproject_id FROM subproject_roles WHERE project_user_id IN ${projectUserIdsOfUser})`
const placeIdsOfUser = `SELECT place_id FROM places WHERE subproject_id IN (${subprojectIdsOfUser}) AND place_id IN (SELECT place_id FROM place_roles WHERE project_user_id IN ${projectUserIdsOfUser})`

// Tables attached at project, subproject or place level (one row references
// exactly one of them): the parent on each level must itself be in scope
const multilevelScope = `project_id IN (${projectIdsOfUser}) AND (subproject_id IS NULL OR subproject_id IN (${subprojectIdsOfUser})) AND (place_id IS NULL OR place_id IN (${placeIdsOfUser}))`

const auditColumns = ['created_at', 'updated_at', 'updated_by']

/**
 * @typedef {{ where?: string, columns?: string[], primaryKey: string[] }} ShapeDefinition
 */

/** @type {Record<string, ShapeDefinition>} */
export const shapeDefinitions = {
  users: {
    columns: [
      'user_id',
      'name',
      'email',
      'image',
      'email_verified',
      'sys_period',
      'created_at',
      'updated_at',
    ],
    // own user row plus the users behind every synced account
    // (project owners) and every member of the user's projects —
    // project_users.auth_user_id references them; the local foreign
    // keys need the referenced rows to sync
    where: `user_id = $1 OR user_id IN (SELECT user_id FROM accounts WHERE account_id IN (SELECT account_id FROM projects WHERE project_id IN (${projectIdsOfUser}))) OR user_id IN (SELECT auth_user_id FROM project_users WHERE project_id IN (${projectIdsOfUser}))`,
    primaryKey: ['user_id'],
  },
  auth_sessions: {
    where: `user_id = $1`,
    primaryKey: ['auth_session_id'],
  },
  auth_accounts: {
    where: `user_id = $1`,
    primaryKey: ['auth_account_id'],
  },
  accounts: {
    // own account plus the accounts of every project the user can
    // see: projects reference their owner's account, and the local
    // database enforces foreign keys (deferred, checked when the
    // apply transaction commits) — a parent row that never syncs
    // would poison the whole sync
    where: `user_id = $1 OR account_id IN (SELECT account_id FROM projects WHERE project_id IN (${projectIdsOfUser}))`,
    primaryKey: ['account_id'],
  },
  projects: {
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['project_id'],
  },
  place_levels: {
    columns: [
      'place_level_id',
      'project_id',
      'level',
      'name_singular_de',
      'name_singular_en',
      'name_singular_fr',
      'name_singular_it',
      'name_plural_de',
      'name_plural_en',
      'name_plural_fr',
      'name_plural_it',
      'check_reports',
      'check_report_quantities',
      'check_report_quantities_in_report',
      'action_reports',
      'action_report_quantities',
      'action_report_quantities_in_report',
      'actions',
      'action_quantities',
      'action_quantities_in_action',
      'action_taxa',
      'action_taxa_in_action',
      'checks',
      'check_quantities',
      'check_quantities_in_check',
      'check_taxa',
      'check_taxa_in_check',
      'check_files',
      'check_files_in_check',
      'filtered_views',
      'observations',
      'place_roles_in_place',
      'place_files_in_place',
      ...auditColumns,
    ],
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['place_level_id'],
  },
  filtered_views: {
    columns: [
      'filtered_view_id',
      'project_id',
      'table_name',
      'name_singular_de',
      'name_singular_en',
      'name_singular_fr',
      'name_singular_it',
      'name_plural_de',
      'name_plural_en',
      'name_plural_fr',
      'name_plural_it',
      'filter',
      'label_by',
      'sort',
      ...auditColumns,
    ],
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['filtered_view_id'],
  },
  subprojects: {
    columns: [
      'subproject_id',
      'project_id',
      'name',
      'start_year',
      'end_year',
      'data',
      ...auditColumns,
    ],
    where: `subproject_id IN (${subprojectIdsOfUser})`,
    primaryKey: ['subproject_id'],
  },
  project_users: {
    // label is a GENERATED column — explicit values are rejected on
    // sync insert, so it must be excluded (it derives from email)
    columns: [
      'project_user_id',
      'project_id',
      'email',
      'auth_user_id',
      'sys_period',
      ...auditColumns,
    ],
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['project_user_id'],
  },
  project_roles: {
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['project_role_id'],
  },
  subproject_roles: {
    where: `subproject_id IN (${subprojectIdsOfUser})`,
    primaryKey: ['subproject_role_id'],
  },
  taxonomies: {
    columns: [
      'taxonomy_id',
      'project_id',
      'type',
      'unit_id',
      'name',
      'url',
      'obsolete',
      'data',
      ...auditColumns,
    ],
    where: `project_id IN (${projectIdsOfUser}) OR taxonomy_id IN (SELECT taxonomy_id FROM taxa WHERE taxon_id IN (SELECT taxon_id FROM subproject_taxa WHERE subproject_id IN (${subprojectIdsOfUser})))`,
    primaryKey: ['taxonomy_id'],
  },
  taxa: {
    // taxa of the user's taxonomies plus every taxon referenced by
    // synced subproject/check/action taxa rows — the local foreign
    // keys need the referenced rows to sync
    where: `taxonomy_id IN (SELECT taxonomy_id FROM taxonomies WHERE project_id IN (${projectIdsOfUser})) OR taxon_id IN (SELECT taxon_id FROM subproject_taxa WHERE subproject_id IN (${subprojectIdsOfUser}))`,
    primaryKey: ['taxon_id'],
  },
  subproject_taxa: {
    where: `subproject_id IN (${subprojectIdsOfUser})`,
    primaryKey: ['subproject_taxon_id'],
  },
  lists: {
    columns: [
      'list_id',
      'project_id',
      'name',
      'value_type',
      'data',
      'obsolete',
      ...auditColumns,
    ],
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['list_id'],
  },
  list_values: {
    columns: [
      'list_value_id',
      'list_id',
      'value_integer',
      'value_numeric',
      'value_text',
      'value_date',
      'value_datetime',
      'obsolete',
      ...auditColumns,
    ],
    where: `list_id IN (SELECT list_id FROM lists WHERE project_id IN (${projectIdsOfUser}))`,
    primaryKey: ['list_value_id'],
  },
  units: {
    columns: [
      'unit_id',
      'project_id',
      'name',
      'summable',
      'sort',
      'type',
      ...auditColumns,
    ],
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['unit_id'],
  },
  places: {
    where: `place_id IN (${placeIdsOfUser})`,
    primaryKey: ['place_id'],
  },
  actions: {
    columns: [
      'action_id',
      'place_id',
      'date',
      'data',
      'geometry',
      'bbox',
      'relevant_for_reports',
      ...auditColumns,
    ],
    where: `place_id IN (${placeIdsOfUser})`,
    primaryKey: ['action_id'],
  },
  action_quantities: {
    where: `action_id IN (SELECT action_id FROM actions WHERE place_id IN (${placeIdsOfUser}))`,
    primaryKey: ['action_quantity_id'],
  },
  checks: {
    columns: [
      'check_id',
      'place_id',
      'date',
      'data',
      'geometry',
      'bbox',
      'relevant_for_reports',
      ...auditColumns,
    ],
    where: `place_id IN (${placeIdsOfUser})`,
    primaryKey: ['check_id'],
  },
  check_quantities: {
    where: `check_id IN (SELECT check_id FROM checks WHERE place_id IN (${placeIdsOfUser}))`,
    primaryKey: ['check_quantity_id'],
  },
  check_taxa: {
    where: `check_id IN (SELECT check_id FROM checks WHERE place_id IN (${placeIdsOfUser}))`,
    primaryKey: ['check_taxon_id'],
  },
  action_taxa: {
    where: `action_id IN (SELECT action_id FROM actions WHERE place_id IN (${placeIdsOfUser}))`,
    primaryKey: ['action_taxon_id'],
  },
  check_reports: {
    columns: [
      'place_check_report_id',
      'place_id',
      'year',
      'data',
      ...auditColumns,
    ],
    where: `place_id IN (${placeIdsOfUser})`,
    primaryKey: ['place_check_report_id'],
  },
  action_reports: {
    columns: [
      'place_action_report_id',
      'place_id',
      'year',
      'data',
      ...auditColumns,
    ],
    where: `place_id IN (${placeIdsOfUser})`,
    primaryKey: ['place_action_report_id'],
  },
  check_report_quantities: {
    where: `place_check_report_id IN (SELECT place_check_report_id FROM check_reports WHERE place_id IN (${placeIdsOfUser}))`,
    primaryKey: ['place_check_report_quantity_id'],
  },
  messages: {
    primaryKey: ['message_id'],
  },
  user_messages: {
    where: `user_id = $1`,
    primaryKey: ['user_message_id'],
  },
  place_roles: {
    where: `place_id IN (${placeIdsOfUser})`,
    primaryKey: ['place_role_id'],
  },
  goals: {
    columns: [
      'goal_id',
      'subproject_id',
      'year',
      'name',
      'data',
      ...auditColumns,
    ],
    where: `subproject_id IN (${subprojectIdsOfUser})`,
    primaryKey: ['goal_id'],
  },
  goal_reports: {
    where: `goal_id IN (SELECT goal_id FROM goals WHERE subproject_id IN (${subprojectIdsOfUser}))`,
    primaryKey: ['goal_report_id'],
  },
  subproject_reports: {
    columns: [
      'subproject_report_id',
      'subproject_id',
      'subproject_report_design_id',
      'year',
      'data',
      ...auditColumns,
    ],
    where: `subproject_id IN (${subprojectIdsOfUser})`,
    primaryKey: ['subproject_report_id'],
  },
  subproject_report_designs: {
    columns: [
      'subproject_report_design_id',
      'project_id',
      'name',
      'active',
      'design',
      ...auditColumns,
    ],
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['subproject_report_design_id'],
  },
  project_reports: {
    columns: [
      'project_report_id',
      'project_id',
      'year',
      'data',
      ...auditColumns,
    ],
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['project_report_id'],
  },
  project_report_designs: {
    columns: [
      'project_report_design_id',
      'project_id',
      'name',
      'active',
      'design',
      ...auditColumns,
    ],
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['project_report_design_id'],
  },
  project_report_subdesigns: {
    columns: [
      'project_report_subdesign_id',
      'project_id',
      'name',
      'design',
      ...auditColumns,
    ],
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['project_report_subdesign_id'],
  },
  files: {
    columns: [
      'file_id',
      'project_id',
      'subproject_id',
      'place_id',
      'action_id',
      'check_id',
      'name',
      'size',
      'data',
      'mimetype',
      'width',
      'height',
      'file',
      'preview',
      'url',
      'uuid',
      'preview_uuid',
      ...auditColumns,
    ],
    // files created below a place also carry place_id, so actions/checks
    // (synced per place) need no check of their own
    where: multilevelScope,
    primaryKey: ['file_id'],
  },
  field_types: {
    columns: ['field_type_id', 'name', 'sort', 'comment', ...auditColumns],
    primaryKey: ['field_type_id'],
  },
  widget_types: {
    columns: [
      'widget_type_id',
      'name',
      'needs_list',
      'sort',
      'comment',
      ...auditColumns,
    ],
    primaryKey: ['widget_type_id'],
  },
  widgets_for_fields: {
    primaryKey: ['widget_for_field_id'],
  },
  fields: {
    columns: [
      'field_id',
      'project_id',
      'account_id',
      'table_name',
      'level',
      'field_type_id',
      'widget_type_id',
      'name',
      'field_label',
      'list_id',
      'preset',
      'obsolete',
      ...auditColumns,
    ],
    where: `project_id IN (${projectIdsOfUser}) OR account_id IN (SELECT account_id FROM accounts WHERE user_id = $1)`,
    primaryKey: ['field_id'],
  },
  field_sorts: {
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['field_sort_id'],
  },
  observation_imports: {
    columns: [
      'observation_import_id',
      'subproject_id',
      'created_time',
      'inserted_count',
      'id_field',
      'geometry_method',
      'geojson_geometry_field',
      'x_coordinate_field',
      'y_coordinate_field',
      'crs',
      'label_creation',
      'name',
      'attribution',
      'previous_import',
      'download_from_gbif',
      'gbif_filters',
      'gbif_download_key',
      'gbif_error',
      ...auditColumns,
    ],
    where: `subproject_id IN (${subprojectIdsOfUser})`,
    primaryKey: ['observation_import_id'],
  },
  observations: {
    where: `observation_import_id IN (SELECT observation_import_id FROM observation_imports WHERE subproject_id IN (${subprojectIdsOfUser})) AND (place_id IS NULL OR place_id IN (${placeIdsOfUser}))`,
    primaryKey: ['observation_id'],
  },
  wms_services: {
    columns: [
      'wms_service_id',
      'project_id',
      'url',
      'image_formats',
      'image_format',
      'version',
      'info_formats',
      'info_format',
      'default_crs',
      ...auditColumns,
    ],
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['wms_service_id'],
  },
  wms_service_layers: {
    where: `wms_service_id IN (SELECT wms_service_id FROM wms_services WHERE project_id IN (${projectIdsOfUser}))`,
    primaryKey: ['wms_service_layer_id'],
  },
  wms_layers: {
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['wms_layer_id'],
  },
  wfs_services: {
    columns: [
      'wfs_service_id',
      'project_id',
      'url',
      'version',
      'info_formats',
      'info_format',
      'default_crs',
      ...auditColumns,
    ],
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['wfs_service_id'],
  },
  wfs_service_layers: {
    where: `wfs_service_id IN (SELECT wfs_service_id FROM wfs_services WHERE project_id IN (${projectIdsOfUser}))`,
    primaryKey: ['wfs_service_layer_id'],
  },
  vector_layers: {
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['vector_layer_id'],
  },
  vector_layer_geoms: {
    where: `vector_layer_id IN (SELECT vector_layer_id FROM vector_layers WHERE project_id IN (${projectIdsOfUser}))`,
    primaryKey: ['vector_layer_geom_id'],
  },
  vector_layer_displays: {
    columns: [
      'vector_layer_display_id',
      'vector_layer_id',
      'display_property_value',
      'marker_type',
      'circle_marker_radius',
      'marker_symbol',
      'marker_size',
      'stroke',
      'color',
      'weight',
      'line_cap',
      'line_join',
      'dash_array',
      'dash_offset',
      'fill',
      'fill_color',
      'fill_opacity_percent',
      'fill_rule',
      ...auditColumns,
    ],
    where: `vector_layer_id IN (SELECT vector_layer_id FROM vector_layers WHERE project_id IN (${projectIdsOfUser}))`,
    primaryKey: ['vector_layer_display_id'],
  },
  layer_presentations: {
    columns: [
      'layer_presentation_id',
      'wms_layer_id',
      'vector_layer_id',
      'project_id',
      'active',
      'opacity_percent',
      'transparent',
      'grayscale',
      'max_zoom',
      'min_zoom',
      ...auditColumns,
    ],
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['layer_presentation_id'],
  },
  charts: {
    columns: [
      'chart_id',
      'project_id',
      'subproject_id',
      'place_id',
      'years_current',
      'years_previous',
      'years_specific',
      'years_last_x',
      'years_since',
      'years_until',
      'chart_type',
      'name',
      'subjects_stacked',
      'subjects_single',
      'percent',
      'for_subprojects',
      ...auditColumns,
    ],
    where: multilevelScope,
    primaryKey: ['chart_id'],
  },
  chart_subjects: {
    where: `chart_id IN (SELECT chart_id FROM charts WHERE ${multilevelScope})`,
    primaryKey: ['chart_subject_id'],
  },
  project_crs: {
    columns: [
      'project_crs_id',
      'crs_id',
      'project_id',
      'code',
      'name',
      'proj4',
      ...auditColumns,
    ],
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['project_crs_id'],
  },
  qcs: {
    primaryKey: ['qcs_id'],
  },
  qc_assignments: {
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['qc_assignment_id'],
  },
  project_qcs: {
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['project_qc_id'],
  },
  exports: {
    primaryKey: ['exports_id'],
  },
  export_assignments: {
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['export_assignment_id'],
  },
  project_exports: {
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['project_exports_id'],
  },
  project_export_assignments: {
    where: `project_id IN (${projectIdsOfUser})`,
    primaryKey: ['project_export_assignment_id'],
  },
}

const SHAPE_PATH = '/v1/shape'

/**
 * Authorizes a forwarded Electric shape request against shapeDefinitions.
 * `forwardedUri` is the raw request URI (path + query) as seen by Caddy;
 * `userId` is the user_id claim of the verified JWT.
 * @param {{ method?: string, forwardedUri?: string, userId: string }} input
 * @returns {{ ok: true } | { ok: false, reason: string }}
 */
export const authorizeShapeRequest = ({ method, forwardedUri, userId }) => {
  if (method && method.toUpperCase() !== 'GET') {
    return { ok: false, reason: `method ${method} not allowed` }
  }
  if (!forwardedUri) return { ok: false, reason: 'missing forwarded uri' }

  let parsed
  try {
    parsed = new URL(forwardedUri, 'http://electric')
  } catch {
    return { ok: false, reason: 'unparseable forwarded uri' }
  }
  if (parsed.pathname !== SHAPE_PATH) {
    return { ok: false, reason: `path ${parsed.pathname} not allowed` }
  }

  const query = parsed.searchParams
  const table = query.get('table')
  if (!table || !Object.hasOwn(shapeDefinitions, table)) {
    return { ok: false, reason: `table ${table ?? '(none)'} not allowed` }
  }
  const definition = shapeDefinitions[table]

  const where = query.get('where')
  const paramKeys = [...query.keys()].filter((key) => key.startsWith('params['))
  if (definition.where === undefined) {
    if (where !== null || paramKeys.length > 0) {
      return { ok: false, reason: `table ${table} takes no where clause` }
    }
  } else {
    if (where !== definition.where) {
      return { ok: false, reason: `where clause for ${table} does not match` }
    }
    if (paramKeys.length !== 1 || paramKeys[0] !== 'params[1]') {
      return { ok: false, reason: `unexpected params for ${table}` }
    }
    if (query.get('params[1]') !== userId) {
      return { ok: false, reason: `params[1] is not the caller for ${table}` }
    }
  }

  const columns = query.get('columns')
  if (columns !== null && definition.columns) {
    const allowed = new Set(definition.columns)
    // the client sends columns quoted: "col_a","col_b"
    const requested = columns
      .split(',')
      .map((column) => column.replace(/^"(.*)"$/, '$1').replace(/""/g, '"'))
    if (!requested.every((column) => allowed.has(column))) {
      return { ok: false, reason: `columns for ${table} not allowed` }
    }
  }

  return { ok: true }
}
