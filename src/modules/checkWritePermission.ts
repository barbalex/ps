import type { PGlite } from '@electric-sql/pglite'

type RowData = Record<string, unknown>
type Permission = 'write-specific' | 'write-all' | 'design'

type CheckConfig = {
  /** SQL returning a single `role` column. $1 = projectUserIds (uuid[]), $2 = parentId */
  sql: string
  getParentId: (row: RowData) => string | null | undefined
  minPermission?: Permission
}

const ROLE_ORDER = [
  'read-specific',
  'read-all',
  'write-specific',
  'write-all',
  'design',
  'own',
]

function hasPermission(
  role: string | undefined,
  min: Permission = 'write-specific',
): boolean {
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
  'exports',
  'messages',
  'user_messages',
])

// Resolves an auth user to their project directory rows: claimed rows
// (auth_user_id) plus rows whose email matches the auth user's email
async function projectUserIds(
  db: PGlite,
  userId: string,
): Promise<string[] | null> {
  const res = await db.query<{ project_user_id: string }>(
    `SELECT pu.project_user_id
     FROM project_users pu
     WHERE pu.auth_user_id = $1
        OR pu.email = (SELECT email FROM users WHERE user_id = $1)`,
    [userId],
  )
  const ids = res.rows.map((r) => r.project_user_id)
  return ids.length > 0 ? ids : null
}

const projectDirect = (col = 'project_id'): CheckConfig => ({
  sql: `SELECT role FROM project_roles WHERE project_id = $2 AND project_user_id = ANY($1) LIMIT 1`,
  getParentId: (row) => row[col] as string,
})
const projectDesign = (col = 'project_id'): CheckConfig => ({
  ...projectDirect(col),
  minPermission: 'design',
})

const subprojectDirect = (col = 'subproject_id'): CheckConfig => ({
  sql: `SELECT role FROM subproject_roles WHERE subproject_id = $2 AND project_user_id = ANY($1) LIMIT 1`,
  getParentId: (row) => row[col] as string,
})

const placeDirect = (col = 'place_id'): CheckConfig => ({
  sql: `SELECT role FROM place_roles WHERE place_id = $2 AND project_user_id = ANY($1) LIMIT 1`,
  getParentId: (row) => row[col] as string,
})

const TABLE_CONFIG: Record<string, CheckConfig> = {
  // Directory and role management — require designer
  project_users: projectDesign(),
  project_roles: projectDesign(),
  subproject_roles: {
    sql: `SELECT role FROM subproject_roles WHERE subproject_id = $2 AND project_user_id = ANY($1) LIMIT 1`,
    getParentId: (row) => row.subproject_id as string,
    minPermission: 'design',
  },
  place_roles: {
    sql: `SELECT role FROM place_roles WHERE place_id = $2 AND project_user_id = ANY($1) LIMIT 1`,
    getParentId: (row) => row.place_id as string,
    minPermission: 'design',
  },

  // Project-level — direct project_id
  // subprojects itself is governed by the project (backend: enforce_project_write)
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
  qc_assignments: projectDirect(),
  export_assignments: projectDesign(),
  project_exports: projectDesign(),
  project_export_assignments: projectDesign(),

  // Project-level — via join
  taxa: {
    sql: `SELECT pr.role FROM project_roles pr JOIN taxonomies t ON t.project_id = pr.project_id WHERE t.taxonomy_id = $2 AND pr.project_user_id = ANY($1) LIMIT 1`,
    getParentId: (row) => row.taxonomy_id as string,
  },
  list_values: {
    sql: `SELECT pr.role FROM project_roles pr JOIN lists l ON l.project_id = pr.project_id WHERE l.list_id = $2 AND pr.project_user_id = ANY($1) LIMIT 1`,
    getParentId: (row) => row.list_id as string,
  },
  wms_service_layers: {
    sql: `SELECT pr.role FROM project_roles pr JOIN wms_services ws ON ws.project_id = pr.project_id WHERE ws.wms_service_id = $2 AND pr.project_user_id = ANY($1) LIMIT 1`,
    getParentId: (row) => row.wms_service_id as string,
  },
  wfs_service_layers: {
    sql: `SELECT pr.role FROM project_roles pr JOIN wfs_services ws ON ws.project_id = pr.project_id WHERE ws.wfs_service_id = $2 AND pr.project_user_id = ANY($1) LIMIT 1`,
    getParentId: (row) => row.wfs_service_id as string,
  },
  vector_layer_geoms: {
    sql: `SELECT pr.role FROM project_roles pr JOIN vector_layers vl ON vl.project_id = pr.project_id WHERE vl.vector_layer_id = $2 AND pr.project_user_id = ANY($1) LIMIT 1`,
    getParentId: (row) => row.vector_layer_id as string,
  },
  vector_layer_displays: {
    sql: `SELECT pr.role FROM project_roles pr JOIN vector_layers vl ON vl.project_id = pr.project_id WHERE vl.vector_layer_id = $2 AND pr.project_user_id = ANY($1) LIMIT 1`,
    getParentId: (row) => row.vector_layer_id as string,
  },

  // Subproject-level — direct subproject_id
  subprojects: projectDirect(),
  subproject_taxa: subprojectDirect(),
  observation_imports: subprojectDirect(),
  goals: subprojectDirect(),
  subproject_reports: subprojectDirect(),

  // Subproject-level — via join
  goal_reports: {
    sql: `SELECT sr.role FROM subproject_roles sr JOIN goals g ON g.subproject_id = sr.subproject_id WHERE g.goal_id = $2 AND sr.project_user_id = ANY($1) LIMIT 1`,
    getParentId: (row) => row.goal_id as string,
  },

  // Place-level — direct place_id
  // places itself is special-cased in checkWritePermission (checkPlaces):
  // the backend governs it by the subproject/project, never by place_roles
  checks: placeDirect(),
  check_reports: placeDirect(),
  action_reports: placeDirect(),
  observations: placeDirect(),
  actions: placeDirect(),

  // Place-level — via join
  action_quantities: {
    sql: `SELECT plr.role FROM place_roles plr JOIN actions a ON a.place_id = plr.place_id WHERE a.action_id = $2 AND plr.project_user_id = ANY($1) LIMIT 1`,
    getParentId: (row) => row.action_id as string,
  },
  action_taxa: {
    sql: `SELECT plr.role FROM place_roles plr JOIN actions a ON a.place_id = plr.place_id WHERE a.action_id = $2 AND plr.project_user_id = ANY($1) LIMIT 1`,
    getParentId: (row) => row.action_id as string,
  },
  check_quantities: {
    sql: `SELECT plr.role FROM place_roles plr JOIN checks c ON c.place_id = plr.place_id WHERE c.check_id = $2 AND plr.project_user_id = ANY($1) LIMIT 1`,
    getParentId: (row) => row.check_id as string,
  },
  check_taxa: {
    sql: `SELECT plr.role FROM place_roles plr JOIN checks c ON c.place_id = plr.place_id WHERE c.check_id = $2 AND plr.project_user_id = ANY($1) LIMIT 1`,
    getParentId: (row) => row.check_id as string,
  },
  check_report_quantities: {
    sql: `SELECT plr.role FROM place_roles plr JOIN check_reports cr ON cr.place_id = plr.place_id WHERE cr.place_check_report_id = $2 AND plr.project_user_id = ANY($1) LIMIT 1`,
    getParentId: (row) => row.place_check_report_id as string,
  },
  action_report_quantities: {
    sql: `SELECT plr.role FROM place_roles plr JOIN action_reports ar ON ar.place_id = plr.place_id WHERE ar.place_action_report_id = $2 AND plr.project_user_id = ANY($1) LIMIT 1`,
    getParentId: (row) => row.place_action_report_id as string,
  },
}

/**
 * Given a table name and row data (merged prev + draft), determine if the
 * current user has permission to write.
 * `operation` ('insert' | 'update' | ...) distinguishes create flows, where
 * anchor tables can't be checked by their own id yet.
 * Returns an object: { allowed: boolean; userRole?: string }
 */
export async function checkWritePermission(
  db: PGlite,
  userId: string,
  table: string,
  row: RowData,
  operation?: string,
): Promise<{ allowed: boolean; userRole?: string }> {
  if (SKIP_TABLES.has(table)) return { allowed: true }

  // The backend (enforce_projects_write) lets only the owner of the account
  // create a project in it; projects_insert_owner_trigger adds them to the
  // directory with the own role
  if (table === 'projects' && operation === 'insert') {
    return checkProjectInsert(db, userId, row)
  }

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
  // The backend (enforce_places_write) governs places by their subproject
  // or the subproject's project — place_roles is never consulted for them,
  // and a newly created place has no place_roles rows anyway
  if (table === 'places') {
    return checkPlaces(db, userId, row)
  }

  const config = TABLE_CONFIG[table]
  if (!config) {
    // Unknown table — allow by default so we don't disrupt unknown flows
    console.warn(
      `checkWritePermission: no config for table "${table}", allowing write`,
    )
    return { allowed: true }
  }

  const puIds = await projectUserIds(db, userId)
  if (!puIds) return { allowed: false }

  const parentId = config.getParentId(row)
  if (!parentId) return { allowed: true }

  const res = await db.query<{ role: string }>(config.sql, [puIds, parentId])
  const role = res.rows[0]?.role
  return { allowed: hasPermission(role, config.minPermission), userRole: role }
}

// Mirrors the backend's enforce_projects_write: only the owner of the
// account (accounts.user_id) may create a project in it. A missing or
// foreign account_id is denied.
async function checkProjectInsert(
  db: PGlite,
  userId: string,
  row: RowData,
): Promise<{ allowed: boolean; userRole?: string }> {
  if (!row.account_id) return { allowed: false }
  const res = await db.query<{ allowed: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM accounts WHERE account_id = $2 AND user_id = $1) AS allowed`,
    [userId, row.account_id],
  )
  return { allowed: Boolean(res.rows[0]?.allowed) }
}

async function checkMultiParent(
  db: PGlite,
  userId: string,
  row: RowData,
): Promise<{ allowed: boolean; userRole?: string }> {
  const puIds = await projectUserIds(db, userId)
  if (!puIds) return { allowed: false }

  // Check by most specific scope: place > subproject > project
  if (row.place_id) {
    const res = await db.query<{ role: string }>(
      `SELECT role FROM place_roles WHERE place_id = $2 AND project_user_id = ANY($1) LIMIT 1`,
      [puIds, row.place_id],
    )
    const role = res.rows[0]?.role
    return { allowed: hasPermission(role), userRole: role }
  }
  if (row.subproject_id) {
    const res = await db.query<{ role: string }>(
      `SELECT role FROM subproject_roles WHERE subproject_id = $2 AND project_user_id = ANY($1) LIMIT 1`,
      [puIds, row.subproject_id],
    )
    const role = res.rows[0]?.role
    return { allowed: hasPermission(role), userRole: role }
  }
  if (row.project_id) {
    const res = await db.query<{ role: string }>(
      `SELECT role FROM project_roles WHERE project_id = $2 AND project_user_id = ANY($1) LIMIT 1`,
      [puIds, row.project_id],
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
  const puIds = await projectUserIds(db, userId)
  if (!puIds) return { allowed: false }

  // Both wms_layer and vector_layer belong to a project; check whichever is set
  if (row.wms_layer_id) {
    const res = await db.query<{ role: string }>(
      `SELECT pr.role FROM project_roles pr JOIN wms_layers wl ON wl.project_id = pr.project_id WHERE wl.wms_layer_id = $2 AND pr.project_user_id = ANY($1) LIMIT 1`,
      [puIds, row.wms_layer_id],
    )
    const role = res.rows[0]?.role
    if (role) return { allowed: hasPermission(role), userRole: role }
  }
  if (row.vector_layer_id) {
    const res = await db.query<{ role: string }>(
      `SELECT pr.role FROM project_roles pr JOIN vector_layers vl ON vl.project_id = pr.project_id WHERE vl.vector_layer_id = $2 AND pr.project_user_id = ANY($1) LIMIT 1`,
      [puIds, row.vector_layer_id],
    )
    const role = res.rows[0]?.role
    if (role) return { allowed: hasPermission(role), userRole: role }
  }
  return { allowed: false }
}

// Mirrors the backend's enforce_places_write: places are governed by the
// role on their subproject or on the subproject's project. Level-2 places
// carry parent_id instead of subproject_id, so navigate up one level.
async function checkPlaces(
  db: PGlite,
  userId: string,
  row: RowData,
): Promise<{ allowed: boolean; userRole?: string }> {
  const puIds = await projectUserIds(db, userId)
  if (!puIds) return { allowed: false }

  let subprojectId = row.subproject_id as string | null | undefined
  if (!subprojectId && row.parent_id) {
    const parentRes = await db.query<{ subproject_id: string | null }>(
      `SELECT subproject_id FROM places WHERE place_id = $1`,
      [row.parent_id],
    )
    subprojectId = parentRes.rows[0]?.subproject_id ?? null
  }
  if (!subprojectId) return { allowed: true }

  const res = await db.query<{
    sub_role: string | null
    proj_role: string | null
  }>(
    `SELECT
      (SELECT role FROM subproject_roles WHERE subproject_id = $2 AND project_user_id = ANY($1)
         LIMIT 1) AS sub_role,
      (SELECT pr.role FROM project_roles pr
        JOIN subprojects sp ON sp.project_id = pr.project_id
        WHERE sp.subproject_id = $2 AND pr.project_user_id = ANY($1)
          LIMIT 1) AS proj_role`,
    [puIds, subprojectId],
  )
  const subRole = res.rows[0]?.sub_role ?? undefined
  const projRole = res.rows[0]?.proj_role ?? undefined
  return {
    allowed: hasPermission(subRole) || hasPermission(projRole),
    userRole: subRole ?? projRole,
  }
}
