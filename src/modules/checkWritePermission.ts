import type { PGlite } from '@electric-sql/pglite'

type RowData = Record<string, unknown>
type Permission = 'writer' | 'designer'

type CheckConfig = {
  /** SQL returning a single `role` column. $1 = userId, $2 = parentId */
  sql: string
  getParentId: (row: RowData) => string | null | undefined
  minPermission?: Permission
}

const ROLE_ORDER = ['reader', 'writer', 'designer', 'owner']

function hasPermission(role: string | undefined, min: Permission = 'writer'): boolean {
  if (!role) return false
  return ROLE_ORDER.indexOf(role) >= ROLE_ORDER.indexOf(min)
}

// Tables where no role check is needed: user-owned data, global reference data
const SKIP_TABLES = new Set([
  'users',
  'accounts',
  'auth_sessions',
  'auth_accounts',
  'auth_verifications',
  'auth_two_factors',
  'auth_passkeys',
  'field_types',
  'widget_types',
  'widgets_for_fields',
  'crs',
  'qcs',
  'messages',
  'user_messages',
])

const projectDirect = (col = 'project_id'): CheckConfig => ({
  sql: `SELECT role FROM project_users WHERE project_id = $2 AND user_id = $1`,
  getParentId: (row) => row[col] as string,
})

const subprojectDirect = (col = 'subproject_id'): CheckConfig => ({
  sql: `SELECT role FROM subproject_users WHERE subproject_id = $2 AND user_id = $1`,
  getParentId: (row) => row[col] as string,
})

const placeDirect = (col = 'place_id'): CheckConfig => ({
  sql: `SELECT role FROM place_users WHERE place_id = $2 AND user_id = $1`,
  getParentId: (row) => row[col] as string,
})

const TABLE_CONFIG: Record<string, CheckConfig> = {
  // Role management — require designer
  project_users: {
    sql: `SELECT role FROM project_users WHERE project_id = $2 AND user_id = $1`,
    getParentId: (row) => row.project_id as string,
    minPermission: 'designer',
  },
  subproject_users: {
    sql: `SELECT role FROM subproject_users WHERE subproject_id = $2 AND user_id = $1`,
    getParentId: (row) => row.subproject_id as string,
    minPermission: 'designer',
  },
  place_users: {
    sql: `SELECT role FROM place_users WHERE place_id = $2 AND user_id = $1`,
    getParentId: (row) => row.place_id as string,
    minPermission: 'designer',
  },

  // Project-level — direct project_id
  projects: projectDirect(),
  place_levels: projectDirect(),
  taxonomies: projectDirect(),
  lists: projectDirect(),
  units: projectDirect(),
  fields: projectDirect(),
  field_sorts: projectDirect(),
  subproject_report_designs: projectDirect(),
  project_reports: projectDirect(),
  project_report_designs: projectDirect(),
  project_report_subdesigns: projectDirect(),
  wms_services: projectDirect(),
  wms_layers: projectDirect(),
  wfs_services: projectDirect(),
  vector_layers: projectDirect(),
  project_crs: projectDirect(),
  qcs_assignment: projectDirect(),

  // Project-level — via join
  taxa: {
    sql: `SELECT pu.role FROM project_users pu JOIN taxonomies t ON t.project_id = pu.project_id WHERE t.taxonomy_id = $2 AND pu.user_id = $1`,
    getParentId: (row) => row.taxonomy_id as string,
  },
  list_values: {
    sql: `SELECT pu.role FROM project_users pu JOIN lists l ON l.project_id = pu.project_id WHERE l.list_id = $2 AND pu.user_id = $1`,
    getParentId: (row) => row.list_id as string,
  },
  wms_service_layers: {
    sql: `SELECT pu.role FROM project_users pu JOIN wms_services ws ON ws.project_id = pu.project_id WHERE ws.wms_service_id = $2 AND pu.user_id = $1`,
    getParentId: (row) => row.wms_service_id as string,
  },
  wfs_service_layers: {
    sql: `SELECT pu.role FROM project_users pu JOIN wfs_services ws ON ws.project_id = pu.project_id WHERE ws.wfs_service_id = $2 AND pu.user_id = $1`,
    getParentId: (row) => row.wfs_service_id as string,
  },
  vector_layer_geoms: {
    sql: `SELECT pu.role FROM project_users pu JOIN vector_layers vl ON vl.project_id = pu.project_id WHERE vl.vector_layer_id = $2 AND pu.user_id = $1`,
    getParentId: (row) => row.vector_layer_id as string,
  },
  vector_layer_displays: {
    sql: `SELECT pu.role FROM project_users pu JOIN vector_layers vl ON vl.project_id = pu.project_id WHERE vl.vector_layer_id = $2 AND pu.user_id = $1`,
    getParentId: (row) => row.vector_layer_id as string,
  },

  // Subproject-level — direct subproject_id
  subprojects: subprojectDirect(),
  subproject_taxa: subprojectDirect(),
  observation_imports: subprojectDirect(),
  goals: subprojectDirect(),
  subproject_reports: subprojectDirect(),

  // Subproject-level — via join
  goal_reports: {
    sql: `SELECT su.role FROM subproject_users su JOIN goals g ON g.subproject_id = su.subproject_id WHERE g.goal_id = $2 AND su.user_id = $1`,
    getParentId: (row) => row.goal_id as string,
  },

  // Place-level — direct place_id
  places: placeDirect(),
  checks: placeDirect(),
  check_reports: placeDirect(),
  action_reports: placeDirect(),
  observations: placeDirect(),
  actions: placeDirect(),

  // Place-level — via join
  action_quantities: {
    sql: `SELECT pu.role FROM place_users pu JOIN actions a ON a.place_id = pu.place_id WHERE a.action_id = $2 AND pu.user_id = $1`,
    getParentId: (row) => row.action_id as string,
  },
  action_taxa: {
    sql: `SELECT pu.role FROM place_users pu JOIN actions a ON a.place_id = pu.place_id WHERE a.action_id = $2 AND pu.user_id = $1`,
    getParentId: (row) => row.action_id as string,
  },
  check_quantities: {
    sql: `SELECT pu.role FROM place_users pu JOIN checks c ON c.place_id = pu.place_id WHERE c.check_id = $2 AND pu.user_id = $1`,
    getParentId: (row) => row.check_id as string,
  },
  check_taxa: {
    sql: `SELECT pu.role FROM place_users pu JOIN checks c ON c.place_id = pu.place_id WHERE c.check_id = $2 AND pu.user_id = $1`,
    getParentId: (row) => row.check_id as string,
  },
  check_report_quantities: {
    sql: `SELECT pu.role FROM place_users pu JOIN check_reports cr ON cr.place_id = pu.place_id WHERE cr.place_check_report_id = $2 AND pu.user_id = $1`,
    getParentId: (row) => row.place_check_report_id as string,
  },
  action_report_quantities: {
    sql: `SELECT pu.role FROM place_users pu JOIN action_reports ar ON ar.place_id = pu.place_id WHERE ar.place_action_report_id = $2 AND pu.user_id = $1`,
    getParentId: (row) => row.place_action_report_id as string,
  },
}

/**
 * Given a table name and row data (merged prev + draft), determine if the
 * current user has permission to write.
 * Returns an object: { allowed: boolean; userRole?: string }
 */
export async function checkWritePermission(
  db: PGlite,
  userId: string,
  table: string,
  row: RowData,
): Promise<{ allowed: boolean; userRole?: string }> {
  if (SKIP_TABLES.has(table)) return { allowed: true }

  // Files and charts carry multiple optional parent IDs; check the most specific.
  if (table === 'files' || table === 'charts') {
    return checkMultiParent(db, userId, row)
  }
  if (table === 'chart_subjects') {
    return checkChartSubjects(db, userId, row)
  }
  // Layer presentations can link to wms_layer or vector_layer
  if (table === 'layer_presentations') {
    return checkLayerPresentation(db, userId, row)
  }

  const config = TABLE_CONFIG[table]
  if (!config) {
    // Unknown table — allow by default so we don't disrupt unknown flows
    console.warn(`checkWritePermission: no config for table "${table}", allowing write`)
    return { allowed: true }
  }

  const parentId = config.getParentId(row)
  if (!parentId) return { allowed: true }

  const res = await db.query<{ role: string }>(config.sql, [userId, parentId])
  const role = res.rows[0]?.role
  return { allowed: hasPermission(role, config.minPermission), userRole: role }
}

async function checkMultiParent(
  db: PGlite,
  userId: string,
  row: RowData,
): Promise<{ allowed: boolean; userRole?: string }> {
  // Check by most specific scope: place > subproject > project
  if (row.place_id) {
    const res = await db.query<{ role: string }>(
      `SELECT role FROM place_users WHERE place_id = $2 AND user_id = $1`,
      [userId, row.place_id],
    )
    const role = res.rows[0]?.role
    return { allowed: hasPermission(role), userRole: role }
  }
  if (row.subproject_id) {
    const res = await db.query<{ role: string }>(
      `SELECT role FROM subproject_users WHERE subproject_id = $2 AND user_id = $1`,
      [userId, row.subproject_id],
    )
    const role = res.rows[0]?.role
    return { allowed: hasPermission(role), userRole: role }
  }
  if (row.project_id) {
    const res = await db.query<{ role: string }>(
      `SELECT role FROM project_users WHERE project_id = $2 AND user_id = $1`,
      [userId, row.project_id],
    )
    const role = res.rows[0]?.role
    return { allowed: hasPermission(role), userRole: role }
  }
  return { allowed: true }
}

async function checkChartSubjects(
  db: PGlite,
  userId: string,
  row: RowData,
): Promise<{ allowed: boolean; userRole?: string }> {
  if (!row.chart_id) return { allowed: true }
  // Join through charts to find the owning scope
  const chartRes = await db.query<{
    project_id: string | null
    subproject_id: string | null
    place_id: string | null
  }>(
    `SELECT project_id, subproject_id, place_id FROM charts WHERE chart_id = $1`,
    [row.chart_id],
  )
  const chart = chartRes.rows[0]
  if (!chart) return { allowed: true }
  return checkMultiParent(db, userId, chart as RowData)
}

async function checkLayerPresentation(
  db: PGlite,
  userId: string,
  row: RowData,
): Promise<{ allowed: boolean; userRole?: string }> {
  // Both wms_layer and vector_layer belong to a project; check whichever is set
  if (row.wms_layer_id) {
    const res = await db.query<{ role: string }>(
      `SELECT pu.role FROM project_users pu JOIN wms_layers wl ON wl.project_id = pu.project_id WHERE wl.wms_layer_id = $2 AND pu.user_id = $1`,
      [userId, row.wms_layer_id],
    )
    const role = res.rows[0]?.role
    if (role) return { allowed: hasPermission(role), userRole: role }
  }
  if (row.vector_layer_id) {
    const res = await db.query<{ role: string }>(
      `SELECT pu.role FROM project_users pu JOIN vector_layers vl ON vl.project_id = pu.project_id WHERE vl.vector_layer_id = $2 AND pu.user_id = $1`,
      [userId, row.vector_layer_id],
    )
    const role = res.rows[0]?.role
    return { allowed: hasPermission(role), userRole: role }
  }
  return { allowed: true }
}
