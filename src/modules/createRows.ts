import { uuidv7 } from '@kripod/uuidv7'

import { addOperationAtom, store, pgliteDbAtom } from '../store.ts'
import { projectTypeNames } from './projectTypeNames.ts'

const account_id = '018cf958-27e2-7000-90d3-59f024d467be' // TODO: replace with auth data when implemented

// TODO: run insert query?
const getPresetData = async ({ projectId = null, table }) => {
  const db = store.get(pgliteDbAtom)
  const fieldsWithPresetsResult = await db.query(
    `select * from fields where project_id = $1 and table_name = $2 and preset is not null`,
    [projectId, table],
  )
  const fieldsWithPresets = fieldsWithPresetsResult?.rows ?? []
  // TODO: include field_type to set correct data type
  const data = {}
  fieldsWithPresets.forEach((field) => {
    data[field.name] = field.preset
  })

  return data
}

// TODO: add account_id
export const createProject = async () => {
  const db = store.get(pgliteDbAtom)
  // find fields with preset values on the data column
  const presetData = await getPresetData({ table: 'projects' })

  const project_id = uuidv7()

  // depending on type, names should be Art/Arten (species) or Lebensraum/Lebensräume (biotope) (in each language)
  const data = {
    project_id,
    account_id,
    type: 'species',
    ...projectTypeNames['species'],
    values_on_multiple_levels: 'first',
    multiple_action_quantities_on_same_level: 'all',
    multiple_check_quantities_on_same_level: 'last',
    files_active_projects: true,
    project_files_in_project: true,
    project_users_in_project: true,
    units_in_project: true,
    fields_in_project: true,
    files_active_subprojects: true,
    goal_reports_in_goal: true,
    subproject_reports_in_subproject: true,
    subproject_taxa_in_subproject: true,
    subproject_users_in_subproject: true,
    subproject_files_in_subproject: true,

    ...presetData,
  }

  const columns = Object.keys(data).join(',')
  const values = Object.values(data)
    .map((_, i) => `$${i + 1}`)
    .join(',')

  await db.query(
    `insert into projects (${columns}) values (${values})`,
    Object.values(data),
  )

  store.set(addOperationAtom, {
    table: 'projects',
    operation: 'insert',
    draft: data,
  })

  return project_id
}

export const createSubproject = async ({ projectId }) => {
  const db = store.get(pgliteDbAtom)
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    projectId,
    table: 'subprojects',
  })

  const subproject_id = uuidv7()
  const data = {
    subproject_id,
    project_id: projectId,

    ...presetData,
  }

  const columns = Object.keys(data).join(',')
  const values = Object.values(data)
    .map((_, i) => `$${i + 1}`)
    .join(',')
  await db.query(
    `insert into subprojects (${columns}) values (${values})`,
    Object.values(data),
  )

  store.set(addOperationAtom, {
    table: 'subprojects',
    operation: 'insert',
    draft: data,
  })

  return subproject_id
}

export const createFile = async ({
  projectId = null,
  subprojectId = null,
  placeId = null,
  actionId = null,
  checkId = null,
  name = null,
  size = null,
  mimetype = null,
  url = null,
  uuid = null,
  width = null,
  height = null,
}) => {
  const db = store.get(pgliteDbAtom)
  // find fields with preset values on the data column
  const presetData = await getPresetData({ table: 'files' })

  const file_id = uuidv7()
  const data = {
    file_id,
    project_id: projectId,
    subproject_id: subprojectId,
    place_id: placeId,
    action_id: actionId,
    check_id: checkId,

    name,
    size,
    mimetype,
    url,
    uuid,
    width,
    height,
    ...presetData,
  }

  const columns = Object.keys(data).join(',')
  const values = Object.values(data)
    .map((_, i) => `$${i + 1}`)
    .join(',')

  await db.query(
    `insert into files (${columns}) values (${values})`,
    Object.values(data),
  )

  store.set(addOperationAtom, {
    table: 'files',
    operation: 'insert',
    draft: data,
  })

  return file_id
}

export const createPlace = async ({
  projectId,
  subprojectId,
  parentId,
  level,
}) => {
  const db = store.get(pgliteDbAtom)
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    projectId,
    table: 'places',
  })

  const place_id = uuidv7()
  const data = {
    place_id,
    subproject_id: subprojectId,
    parent_id: parentId,
    level,

    ...presetData,
  }

  const columns = Object.keys(data).join(',')
  const values = Object.values(data)
    .map((_, i) => `$${i + 1}`)
    .join(',')

  await db.query(
    `insert into places (${columns}) values (${values})`,
    Object.values(data),
  )

  store.set(addOperationAtom, {
    table: 'places',
    operation: 'insert',
    draft: data,
  })

  return place_id
}

export const createWidgetForField = async () => {
  const widget_for_field_id = uuidv7()
  const db = store.get(pgliteDbAtom)
  await db.query(
    `insert into widgets_for_fields (widget_for_field_id) values ($1)`,
    [widget_for_field_id],
  )

  store.set(addOperationAtom, {
    table: 'widgets_for_fields',
    operation: 'insert',
    draft: { widget_for_field_id },
  })

  return widget_for_field_id
}

export const createWidgetType = async () => {
  const widget_type_id = uuidv7()
  const db = store.get(pgliteDbAtom)
  await db.query(
    `insert into widget_types (widget_type_id, needs_list, sort) values ($1, $2, $3)`,
    [widget_type_id, false, 0],
  )

  store.set(addOperationAtom, {
    table: 'widget_types',
    operation: 'insert',
    draft: { widget_type_id, needs_list: false, sort: 0 },
  })

  return widget_type_id
}

export const createFieldType = async () => {
  const field_type_id = uuidv7()
  const db = store.get(pgliteDbAtom)
  await db.query(
    `insert into field_types (field_type_id, sort) values ($1, $2) returning field_type_id`,
    [field_type_id, 0],
  )

  store.set(addOperationAtom, {
    table: 'field_types',
    operation: 'insert',
    draft: { field_type_id, sort: 0 },
  })

  return field_type_id
}

export const createAccount = async () => {
  const account_id = uuidv7()
  const db = store.get(pgliteDbAtom)
  await db.query(`insert into accounts (account_id, type, project_fields_in_account) values ($1, $2, $3)`, [
    account_id,
    'free',
    true,
  ])

  store.set(addOperationAtom, {
    table: 'accounts',
    operation: 'insert',
    draft: { account_id, type: 'free', project_fields_in_account: true },
  })

  return account_id
}

// users creates the db row to ensure creating the app_state too
export const createUser = async ({ setUserId }) => {
  const user_id = uuidv7()
  const db = store.get(pgliteDbAtom)

  // TODO: why setUserId?
  setUserId(user_id)

  await db.query(`INSERT INTO users (user_id) VALUES ($1)`, [user_id])

  store.set(addOperationAtom, {
    table: 'users',
    operation: 'insert',
    draft: { user_id },
  })

  return user_id
}

export const createCrs = async () => {
  const crs_id = uuidv7()
  const db = store.get(pgliteDbAtom)
  await db.query(`insert into crs (crs_id) values ($1)`, [crs_id])
  store.set(addOperationAtom, {
    table: 'crs',
    operation: 'insert',
    draft: { crs_id },
  })

  return crs_id
}

export const createProjectCrs = async ({ projectId }) => {
  const project_crs_id = uuidv7()
  const db = store.get(pgliteDbAtom)
  await db.query(
    `insert into project_crs (project_crs_id, project_id) values ($1, $2)`,
    [project_crs_id, projectId],
  )

  store.set(addOperationAtom, {
    table: 'project_crs',
    operation: 'insert',
    draft: { project_crs_id, project_id: projectId },
  })

  return project_crs_id
}

export const createField = async ({
  projectId = null,
  accountId = null,
  table_name = null,
  level = null,
}) => {
  const db = store.get(pgliteDbAtom)
  const field_id = uuidv7()
  await db.query(
    `insert into fields (field_id, project_id, account_id, table_name, level, field_type_id, widget_type_id) values ($1, $2, $3, $4, $5, $6, $7)`,
    [
      field_id,
      projectId,
      accountId,
      table_name,
      level,
      '018ca19e-7a23-7bf4-8523-ff41e3b60807',
      '018ca1a0-f187-7fdf-955b-4eaadaa92553',
    ],
  )

  store.set(addOperationAtom, {
    table: 'fields',
    operation: 'insert',
    draft: {
      field_id,
      project_id: projectId,
      account_id: accountId,
      table_name,
      level,
      field_type_id: '018ca19e-7a23-7bf4-8523-ff41e3b60807',
      widget_type_id: '018ca1a0-f187-7fdf-955b-4eaadaa92553',
    },
  })

  return field_id
}

export const createUnit = async ({ projectId }) => {
  const unit_id = uuidv7()
  const db = store.get(pgliteDbAtom)
  await db.query(
    `INSERT INTO units (unit_id, project_id, summable, sort, type) VALUES ($1, $2, $3, $4, $5)`,
    [unit_id, projectId, false, 0, 'integer'],
  )

  store.set(addOperationAtom, {
    table: 'units',
    operation: 'insert',
    draft: {
      unit_id,
      project_id: projectId,
      summable: false,
      sort: 0,
      type: 'integer',
    },
  })

  return unit_id
}

export const createList = async ({ projectId, name = null }) => {
  const db = store.get(pgliteDbAtom)
  // find fields with preset values on the data column
  const presetData = await getPresetData({ projectId, table: 'lists' })

  const list_id = uuidv7()
  const data = {
    list_id,
    project_id: projectId,
    name,
    obsolete: false,

    ...presetData,
  }
  const columns = Object.keys(data).join(',')
  const values = Object.values(data)
    .map((_, i) => `$${i + 1}`)
    .join(',')

  await db.query(
    `insert into lists (${columns}) values (${values})`,
    Object.values(data),
  )

  store.set(addOperationAtom, {
    table: 'lists',
    operation: 'insert',
    draft: data,
  })

  return list_id
}

export const createTaxonomy = async ({ projectId }) => {
  const db = store.get(pgliteDbAtom)
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    projectId,
    table: 'taxonomies',
  })

  const taxonomy_id = uuidv7()
  const data = {
    taxonomy_id,
    project_id: projectId,
    obsolete: false,

    ...presetData,
  }

  const columns = Object.keys(data).join(',')
  const values = Object.values(data)
    .map((_, i) => `$${i + 1}`)
    .join(',')
  await db.query(
    `insert into taxonomies (${columns}) values (${values})`,
    Object.values(data),
  )

  store.set(addOperationAtom, {
    table: 'taxonomies',
    operation: 'insert',
    draft: data,
  })

  return taxonomy_id
}

export const createProjectUser = async ({ projectId }) => {
  const db = store.get(pgliteDbAtom)
  const project_user_id = uuidv7()
  await db.query(
    `insert into project_users (project_user_id, project_id, role) values ($1, $2, $3)`,
    [project_user_id, projectId, 'reader'],
  )

  store.set(addOperationAtom, {
    table: 'project_users',
    operation: 'insert',
    draft: {
      project_user_id,
      project_id: projectId,
      role: 'reader',
    },
  })

  return project_user_id
}

export const createProjectReport = async ({ projectId }) => {
  const db = store.get(pgliteDbAtom)
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    projectId,
    table: 'project_reports',
  })

  const project_report_id = uuidv7()
  const data = {
    project_report_id,
    project_id: projectId,
    year: new Date().getFullYear(),

    ...presetData,
  }
  const columns = Object.keys(data).join(',')
  const values = Object.values(data)
    .map((_, i) => `$${i + 1}`)
    .join(',')

  await db.query(
    `insert into project_reports (${columns}) values (${values})`,
    Object.values(data),
  )

  store.set(addOperationAtom, {
    table: 'project_reports',
    operation: 'insert',
    draft: data,
  })

  return project_report_id
}

export const createPlaceLevel = async ({ project_id }) => {
  const db = store.get(pgliteDbAtom)
  const place_level_id = uuidv7()
  await db.query(
    `insert into place_levels (place_level_id, project_id, level, check_reports, check_report_quantities, check_report_quantities_in_report, action_reports, action_report_quantities, action_report_quantities_in_report, actions, action_quantities, action_quantities_in_action, checks, check_quantities, check_quantities_in_check, check_taxa, check_taxa_in_check, observations, place_users_in_place, place_files, place_files_in_place, action_files, check_files, check_files_in_check) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
    [
      place_level_id,
      project_id,
      1,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ],
  )

  store.set(addOperationAtom, {
    table: 'place_levels',
    operation: 'insert',
    draft: {
      place_level_id,
      project_id,
      level: 1,
      check_reports: true,
      check_report_quantities: true,
      check_report_quantities_in_report: true,
      action_reports: true,
      action_report_quantities: true,
      action_report_quantities_in_report: true,
      actions: true,
      action_quantities: true,
      action_quantities_in_action: true,
      checks: true,
      check_quantities: true,
      check_quantities_in_check: true,
      check_taxa: true,
      check_taxa_in_check: true,
      observations: true,
      place_users_in_place: true,
      place_files: true,
      place_files_in_place: true,
      action_files: true,
      check_files: true,
      check_files_in_check: true,
    },
  })

  return place_level_id
}

export const createTaxon = async ({ taxonomyId }) => {
  const db = store.get(pgliteDbAtom)
  const taxon_id = uuidv7()
  await db.query(`insert into taxa (taxon_id, taxonomy_id) values ($1, $2)`, [
    taxon_id,
    taxonomyId,
  ])

  store.set(addOperationAtom, {
    table: 'taxa',
    operation: 'insert',
    draft: { taxon_id, taxonomy_id: taxonomyId },
  })

  return taxon_id
}

export const createListValue = async ({ listId }) => {
  const db = store.get(pgliteDbAtom)
  const list_value_id = uuidv7()
  await db.query(
    `
    insert into list_values (list_value_id, account_id, list_id, obsolete) 
    values ($1, $2, $3, $4)`,
    [list_value_id, account_id, listId, false],
  )

  store.set(addOperationAtom, {
    table: 'list_values',
    operation: 'insert',
    draft: {
      list_value_id,
      account_id,
      list_id: listId,
      obsolete: false,
    },
  })

  return list_value_id
}

export const createGoal = async ({ projectId, subprojectId }) => {
  const db = store.get(pgliteDbAtom)
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    projectId,
    table: 'goals',
  })

  const goal_id = uuidv7()
  const data = {
    goal_id,
    subproject_id: subprojectId,
    year: new Date().getFullYear(),

    ...presetData,
  }

  const columns = Object.keys(data).join(',')
  const values = Object.values(data)
    .map((_, i) => `$${i + 1}`)
    .join(',')

  await db.query(
    `insert into goals (${columns}) values (${values})`,
    Object.values(data),
  )

  store.set(addOperationAtom, {
    table: 'goals',
    operation: 'insert',
    draft: data,
  })

  return goal_id
}

export const createGoalReport = async ({ projectId, goalId }) => {
  const db = store.get(pgliteDbAtom)
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    projectId,
    table: 'goal_reports',
  })

  const goal_report_id = uuidv7()
  console.log('createGoalReport, goal_report_id:', goal_report_id)
  const data = {
    goal_report_id,
    goal_id: goalId,
    account_id,
    ...presetData,
  }

  const columns = Object.keys(data).join(',')
  const values = Object.values(data)
    .map((_, i) => `$${i + 1}`)
    .join(',')
  const sql = `insert into goal_reports (${columns}) values (${values})`

  console.log('createGoalReport', {
    sql,
    data,
    presetData,
    columns,
    values,
    dataValues: Object.values(data),
    projectId,
    goalId,
  })

  // TODO: invalid input syntax for type json
  try {
    await db.query(sql, Object.values(data))
  } catch (error) {
    // TODO: createGoalReport error: invalid input syntax for type json
    console.log('createGoalReport', error)
  }
  store.set(addOperationAtom, {
    table: 'goal_reports',
    operation: 'insert',
    draft: data,
  })

  return goal_report_id
}

export const createSubprojectUser = async ({ subprojectId }) => {
  const db = store.get(pgliteDbAtom)
  const subproject_user_id = uuidv7()
  await db.query(
    `insert into subproject_users (subproject_user_id, subproject_id, role) values ($1, $2, $3)`,
    [subproject_user_id, subprojectId, 'reader'],
  )

  store.set(addOperationAtom, {
    table: 'subproject_users',
    operation: 'insert',
    draft: {
      subproject_user_id,
      subproject_id: subprojectId,
      account_id,
      role: 'reader',
    },
  })

  return subproject_user_id
}

export const createPlaceUser = async ({ placeId }) => {
  const db = store.get(pgliteDbAtom)
  const place_user_id = uuidv7()
  await db.query(
    `insert into place_users (place_user_id, place_id, role) values ($1, $2, $3)`,
    [place_user_id, placeId, 'reader'],
  )

  store.set(addOperationAtom, {
    table: 'place_users',
    operation: 'insert',
    draft: {
      place_user_id,
      place_id: placeId,
      role: 'reader',
    },
  })

  return place_user_id
}

export const createSubprojectTaxon = async ({ subprojectId }) => {
  const db = store.get(pgliteDbAtom)
  const subproject_taxon_id = uuidv7()
  await db.query(
    `insert into subproject_taxa (subproject_taxon_id, subproject_id) values ($1, $2)`,
    [subproject_taxon_id, subprojectId],
  )

  store.set(addOperationAtom, {
    table: 'subproject_taxa',
    operation: 'insert',
    draft: {
      subproject_taxon_id,
      subproject_id: subprojectId,
    },
  })

  return subproject_taxon_id
}

export const createSubprojectReport = async ({ projectId, subprojectId }) => {
  const db = store.get(pgliteDbAtom)
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    projectId,
    table: 'subproject_reports',
  })

  const subproject_report_id = uuidv7()
  const data = {
    subproject_report_id,
    subproject_id: subprojectId,
    year: new Date().getFullYear(),
    ...presetData,
  }

  const columns = Object.keys(data).join(',')
  const values = Object.values(data)
    .map((_, i) => `$${i + 1}`)
    .join(',')

  await db.query(
    `insert into subproject_reports (${columns}) values (${values})`,
    Object.values(data),
  )

  store.set(addOperationAtom, {
    table: 'subproject_reports',
    operation: 'insert',
    draft: data,
  })

  return subproject_report_id
}

export const createCheck = async ({ projectId, placeId }) => {
  const db = store.get(pgliteDbAtom)
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    projectId,
    table: 'checks',
  })

  const check_id = uuidv7()
  const data = {
    check_id,
    place_id: placeId,
    date: new Date(),
    relevant_for_reports: true,
    ...presetData,
  }
  const columns = Object.keys(data).join(',')
  const values = Object.values(data)
    .map((_, i) => `$${i + 1}`)
    .join(',')

  await db.query(
    `insert into checks (${columns}) values (${values})`,
    Object.values(data),
  )

  store.set(addOperationAtom, {
    table: 'checks',
    operation: 'insert',
    draft: data,
  })

  return check_id
}

export const createCheckQuantity = async ({ checkId }) => {
  const db = store.get(pgliteDbAtom)

  // inherit the project's default unit if set
  const projectRes = await db.query<{ checks_default_unit_id: string | null }>(
    `SELECT p.checks_default_unit_id
     FROM projects p
     JOIN subprojects sp ON sp.project_id = p.project_id
     JOIN places pl ON pl.subproject_id = sp.subproject_id
     JOIN checks c ON c.place_id = pl.place_id
     WHERE c.check_id = $1
     LIMIT 1`,
    [checkId],
  )
  const defaultUnitId = projectRes.rows?.[0]?.checks_default_unit_id ?? null

  const check_quantity_id = uuidv7()
  const draft = {
    check_quantity_id,
    check_id: checkId,
    ...(defaultUnitId ? { unit_id: defaultUnitId } : {}),
  }
  const cols = Object.keys(draft).join(', ')
  const vals = Object.keys(draft)
    .map((_, i) => `$${i + 1}`)
    .join(', ')
  await db.query(
    `INSERT INTO check_quantities (${cols}) VALUES (${vals})`,
    Object.values(draft),
  )

  store.set(addOperationAtom, {
    table: 'check_quantities',
    operation: 'insert',
    draft,
  })

  return check_quantity_id
}

export const createCheckTaxon = async ({ checkId }) => {
  const db = store.get(pgliteDbAtom)

  // inherit the project's default unit if set
  const projectRes = await db.query<{
    check_taxa_default_unit_id: string | null
  }>(
    `SELECT p.check_taxa_default_unit_id
     FROM projects p
     JOIN subprojects sp ON sp.project_id = p.project_id
     JOIN places pl ON pl.subproject_id = sp.subproject_id
     JOIN checks c ON c.place_id = pl.place_id
     WHERE c.check_id = $1
     LIMIT 1`,
    [checkId],
  )
  const defaultUnitId = projectRes.rows?.[0]?.check_taxa_default_unit_id ?? null

  const check_taxon_id = uuidv7()
  const draft = {
    check_taxon_id,
    check_id: checkId,
    ...(defaultUnitId ? { unit_id: defaultUnitId } : {}),
  }
  const cols = Object.keys(draft).join(', ')
  const vals = Object.keys(draft)
    .map((_, i) => `$${i + 1}`)
    .join(', ')
  await db.query(
    `INSERT INTO check_taxa (${cols}) VALUES (${vals})`,
    Object.values(draft),
  )

  store.set(addOperationAtom, {
    table: 'check_taxa',
    operation: 'insert',
    draft,
  })

  return check_taxon_id
}

export const createActionTaxon = async ({ actionId }) => {
  const db = store.get(pgliteDbAtom)

  // inherit the project's default unit if set
  const projectRes = await db.query<{
    action_taxa_default_unit_id: string | null
  }>(
    `SELECT p.action_taxa_default_unit_id
     FROM projects p
     JOIN subprojects sp ON sp.project_id = p.project_id
     JOIN places pl ON pl.subproject_id = sp.subproject_id
     JOIN actions a ON a.place_id = pl.place_id
     WHERE a.action_id = $1
     LIMIT 1`,
    [actionId],
  )
  const defaultUnitId =
    projectRes.rows?.[0]?.action_taxa_default_unit_id ?? null

  const action_taxon_id = uuidv7()
  const draft = {
    action_taxon_id,
    action_id: actionId,
    ...(defaultUnitId ? { unit_id: defaultUnitId } : {}),
  }
  const cols = Object.keys(draft).join(', ')
  const vals = Object.keys(draft)
    .map((_, i) => `$${i + 1}`)
    .join(', ')
  await db.query(
    `INSERT INTO action_taxa (${cols}) VALUES (${vals})`,
    Object.values(draft),
  )

  store.set(addOperationAtom, {
    table: 'action_taxa',
    operation: 'insert',
    draft,
  })

  return action_taxon_id
}

export const createAction = async ({ projectId, placeId }) => {
  const db = store.get(pgliteDbAtom)
  // find fields with preset values on the data column
  const presetData = await getPresetData({ projectId, table: 'actions' })

  const action_id = uuidv7()
  const data = {
    action_id,
    place_id: placeId,
    date: new Date(),
    relevant_for_reports: true,
    ...presetData,
  }

  const columns = Object.keys(data).join(',')
  const values = Object.values(data)
    .map((_, i) => `$${i + 1}`)
    .join(',')

  await db.query(
    `insert into actions (${columns}) values (${values})`,
    Object.values(data),
  )

  store.set(addOperationAtom, {
    table: 'actions',
    operation: 'insert',
    draft: data,
  })

  return action_id
}

export const createActionQuantity = async ({ actionId, projectId }) => {
  const db = store.get(pgliteDbAtom)

  // inherit the project's default unit if set
  let defaultUnitId: string | null = null
  if (projectId) {
    const projectRes = await db.query<{
      actions_default_unit_id: string | null
    }>(
      `SELECT actions_default_unit_id FROM projects WHERE project_id = $1 LIMIT 1`,
      [projectId],
    )
    defaultUnitId = projectRes.rows?.[0]?.actions_default_unit_id ?? null
  }

  const action_quantity_id = uuidv7()
  const draft = {
    action_quantity_id,
    action_id: actionId,
    ...(defaultUnitId ? { unit_id: defaultUnitId } : {}),
  }
  const cols = Object.keys(draft).join(', ')
  const vals = Object.keys(draft)
    .map((_, i) => `$${i + 1}`)
    .join(', ')
  await db.query(
    `INSERT INTO action_quantities (${cols}) VALUES (${vals})`,
    Object.values(draft),
  )

  store.set(addOperationAtom, {
    table: 'action_quantities',
    operation: 'insert',
    draft,
  })

  return action_quantity_id
}

export const createCheckReport = async ({ projectId, placeId }) => {
  const db = store.get(pgliteDbAtom)
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    projectId,
    table: 'check_reports',
  })

  const place_check_report_id = uuidv7()
  const data = {
    place_check_report_id,
    place_id: placeId,
    year: new Date().getFullYear(),
    ...presetData,
  }

  const columns = Object.keys(data).join(',')
  const values = Object.values(data)
    .map((_, i) => `$${i + 1}`)
    .join(',')

  await db.query(
    `insert into check_reports (${columns}) values (${values})`,
    Object.values(data),
  )

  store.set(addOperationAtom, {
    table: 'check_reports',
    operation: 'insert',
    draft: data,
  })

  return place_check_report_id
}

export const createCheckReportQuantity = async ({ checkReportId }) => {
  const db = store.get(pgliteDbAtom)

  // inherit the project's default unit if set
  const projectRes = await db.query<{
    check_reports_default_unit_id: string | null
  }>(
    `SELECT p.check_reports_default_unit_id
     FROM projects p
     JOIN subprojects sp ON sp.project_id = p.project_id
     JOIN places pl ON pl.subproject_id = sp.subproject_id
     JOIN check_reports pr ON pr.place_id = pl.place_id
     WHERE pr.place_check_report_id = $1
     LIMIT 1`,
    [checkReportId],
  )
  const defaultUnitId =
    projectRes.rows?.[0]?.check_reports_default_unit_id ?? null

  const place_check_report_quantity_id = uuidv7()
  const draft = {
    place_check_report_quantity_id,
    place_check_report_id: checkReportId,
    ...(defaultUnitId ? { unit_id: defaultUnitId } : {}),
  }
  const cols = Object.keys(draft).join(', ')
  const vals = Object.keys(draft)
    .map((_, i) => `$${i + 1}`)
    .join(', ')
  await db.query(
    `INSERT INTO check_report_quantities (${cols}) VALUES (${vals})`,
    Object.values(draft),
  )

  store.set(addOperationAtom, {
    table: 'check_report_quantities',
    operation: 'insert',
    draft,
  })

  return place_check_report_quantity_id
}

export const createActionReport = async ({ projectId, placeId }) => {
  const db = store.get(pgliteDbAtom)
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    projectId,
    table: 'action_reports',
  })

  const place_action_report_id = uuidv7()
  const data = {
    place_action_report_id,
    place_id: placeId,
    year: new Date().getFullYear(),
    ...presetData,
  }

  const columns = Object.keys(data).join(',')
  const values = Object.values(data)
    .map((_, i) => `$${i + 1}`)
    .join(',')

  await db.query(
    `insert into action_reports (${columns}) values (${values})`,
    Object.values(data),
  )

  store.set(addOperationAtom, {
    table: 'action_reports',
    operation: 'insert',
    draft: data,
  })

  return place_action_report_id
}

export const createActionReportQuantity = async ({ actionReportId }) => {
  const db = store.get(pgliteDbAtom)

  // inherit the project's default unit if set
  const projectRes = await db.query<{
    action_reports_default_unit_id: string | null
  }>(
    `SELECT p.action_reports_default_unit_id
     FROM projects p
     JOIN subprojects sp ON sp.project_id = p.project_id
     JOIN places pl ON pl.subproject_id = sp.subproject_id
     JOIN action_reports pr ON pr.place_id = pl.place_id
     WHERE pr.place_action_report_id = $1
     LIMIT 1`,
    [actionReportId],
  )
  const defaultUnitId =
    projectRes.rows?.[0]?.action_reports_default_unit_id ?? null

  const place_action_report_quantity_id = uuidv7()
  const draft = {
    place_action_report_quantity_id,
    place_action_report_id: actionReportId,
    ...(defaultUnitId ? { unit_id: defaultUnitId } : {}),
  }
  const cols = Object.keys(draft).join(', ')
  const vals = Object.keys(draft)
    .map((_, i) => `$${i + 1}`)
    .join(', ')
  await db.query(
    `INSERT INTO action_report_quantities (${cols}) VALUES (${vals})`,
    Object.values(draft),
  )

  store.set(addOperationAtom, {
    table: 'action_report_quantities',
    operation: 'insert',
    draft,
  })

  return place_action_report_quantity_id
}

export const createMessage = async () => {
  const db = store.get(pgliteDbAtom)
  const message_id = uuidv7()
  const date = new Date()

  await db.query(`insert into messages (message_id, date) values ($1, $2)`, [
    message_id,
    date,
  ])

  store.set(addOperationAtom, {
    table: 'messages',
    operation: 'insert',
    draft: {
      message_id,
      date,
    },
  })

  return message_id
}

export const createWmsLayer = async ({ projectId }) => {
  const db = store.get(pgliteDbAtom)
  const wms_layer_id = uuidv7()
  const res = await db.query(
    `INSERT INTO wms_layers (wms_layer_id, project_id) VALUES ($1, $2)`,
    [wms_layer_id, projectId],
  )

  store.set(addOperationAtom, {
    table: 'wms_layers',
    operation: 'insert',
    draft: {
      wms_layer_id,
      project_id: projectId,
    },
  })

  return wms_layer_id
}

export const createVectorLayer = async ({
  projectId,
  type = null,
  ownTable = null,
  ownTableLevel = null,
  label = null,
  maxFeatures = 1000,
  skipOperationQueue = false, // system-managed layers shouldn't sync back to server
}) => {
  const db = store.get(pgliteDbAtom)

  // First check if vector_layer already exists (e.g., from sync)
  const existing = await db.query(
    `select * from vector_layers 
     where project_id = $1 and label = $2`,
    [projectId, label],
  )

  if (existing?.rows?.[0]) {
    // Return existing record without queuing operation
    return existing.rows[0].vector_layer_id
  }

  // Create new vector_layer locally
  const vector_layer_id = uuidv7()
  const res = await db.query(
    `insert into vector_layers (vector_layer_id, project_id, label, type, own_table, own_table_level, max_features) 
     values ($1, $2, $3, $4, $5, $6, $7) 
     returning *`,
    [
      vector_layer_id,
      projectId,
      label,
      type,
      ownTable,
      ownTableLevel,
      maxFeatures,
    ],
  )

  // Only queue operation if this is a user-created layer (not system-managed)
  if (!skipOperationQueue) {
    store.set(addOperationAtom, {
      table: 'vector_layers',
      operation: 'insert',
      draft: {
        vector_layer_id,
        project_id: projectId,
        label,
        type,
        own_table: ownTable,
        own_table_level: ownTableLevel,
        max_features: maxFeatures,
      },
    })
  }

  return vector_layer_id
}

export const createWfsService = async ({
  projectId = null,
  url = null,
  version = null,
  info_formats = null,
  info_format = null,
  default_crs = null,
}) => {
  const db = store.get(pgliteDbAtom)
  const wfs_service_id = uuidv7()
  const res = await db.query(
    `insert into wfs_services (wfs_service_id, project_id, version, url, info_formats, info_format, default_crs) values ($1, $2, $3, $4, $5, $6, $7) returning *`,
    [
      wfs_service_id,
      projectId,
      version,
      url,
      info_formats,
      info_format,
      default_crs,
    ],
  )

  store.set(addOperationAtom, {
    table: 'wfs_services',
    operation: 'insert',
    draft: {
      wfs_service_id,
      project_id: projectId,
      version,
      url,
      info_formats,
      info_format,
      default_crs,
    },
  })

  // Return full row because FetchWfsCapabilities needs the object
  return res?.rows?.[0]
}

export const createWfsServiceLayer = async ({
  wfsServiceId,
  name = null,
  label = null,
}) => {
  const db = store.get(pgliteDbAtom)
  const wfs_service_layer_id = uuidv7()
  await db.query(
    `insert into wfs_service_layers (wfs_service_layer_id, wfs_service_id, name, label) values ($1, $2, $3, $4)`,
    [wfs_service_layer_id, wfsServiceId, name, label],
  )

  store.set(addOperationAtom, {
    table: 'wfs_service_layers',
    operation: 'insert',
    draft: {
      wfs_service_layer_id,
      wfs_service_id: wfsServiceId,
      name,
      label,
    },
  })

  return wfs_service_layer_id
}

export const createVectorLayerDisplay = async ({
  vectorLayerId = null,
  displayPropertyValue = null,
}) => {
  const db = store.get(pgliteDbAtom)
  const vector_layer_display_id = uuidv7()
  await db.query(
    `
    insert into vector_layer_displays 
    (vector_layer_display_id, vector_layer_id, display_property_value, marker_type, circle_marker_radius, marker_size, stroke, color, weight, line_cap, line_join, fill, fill_color, fill_opacity_percent, fill_rule)
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
  `,
    [
      vector_layer_display_id,
      vectorLayerId,
      displayPropertyValue,
      'circle',
      8,
      16,
      true,
      '#ff0000',
      3,
      'round',
      'round',
      true,
      '#ff0000',
      20,
      'evenodd',
    ],
  )

  store.set(addOperationAtom, {
    table: 'vector_layer_displays',
    operation: 'insert',
    draft: {
      vector_layer_display_id,
      vector_layer_id: vectorLayerId,
      display_property_value: displayPropertyValue,
      marker_type: 'circle',
      circle_marker_radius: 8,
      marker_size: 16,
      stroke: true,
      color: '#ff0000',
      weight: 3,
      line_cap: 'round',
      line_join: 'round',
      fill: true,
      fill_color: '#ff0000',
      fill_opacity_percent: 20,
      fill_rule: 'evenodd',
    },
  })

  return vector_layer_display_id
}

export const createLayerPresentation = async ({
  vectorLayerId = null,
  wmsLayerId = null,
  accountId = account_id, // null,
  active = false,
  transparent = false,
  skipOperationQueue = false, // system-managed table layers shouldn't sync back to server
}) => {
  const db = store.get(pgliteDbAtom)
  const layer_presentation_id = uuidv7()
  await db.query(
    `
    INSERT INTO layer_presentations
    (layer_presentation_id, account_id, vector_layer_id, wms_layer_id, active, opacity_percent, grayscale, transparent, max_zoom, min_zoom)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `,
    [
      layer_presentation_id,
      accountId,
      vectorLayerId,
      wmsLayerId,
      active,
      100,
      false,
      transparent,
      19,
      0,
    ],
  )

  // Only queue operation if this is not a system-managed layer
  if (!skipOperationQueue) {
    store.set(addOperationAtom, {
      table: 'layer_presentations',
      operation: 'insert',
      draft: {
        layer_presentation_id,
        account_id: accountId,
        vector_layer_id: vectorLayerId,
        wms_layer_id: wmsLayerId,
        active,
        opacity_percent: 100,
        grayscale: false,
        transparent,
        max_zoom: 19,
        min_zoom: 0,
      },
    })
  }

  return layer_presentation_id
}

export const createWmsService = async ({
  projectId = null,
  url = null,
  image_formats = null,
  image_format = null,
  version = null,
  info_formats = null,
  info_format = null,
  default_crs = null,
}) => {
  const db = store.get(pgliteDbAtom)
  const wms_service_id = uuidv7()
  await db.query(
    `INSERT INTO wms_services (wms_service_id, project_id, version, url, image_formats, image_format, info_formats, info_format, default_crs) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      wms_service_id,
      projectId,
      version,
      url,
      image_formats,
      image_format,
      info_formats,
      info_format,
      default_crs,
    ],
  )

  store.set(addOperationAtom, {
    table: 'wms_services',
    operation: 'insert',
    draft: {
      wms_service_id,
      project_id: projectId,
      version,
      url,
      image_formats,
      image_format,
      info_formats,
      info_format,
      default_crs,
    },
  })

  return wms_service_id
}

// not in use - multiple insert used instead
export const createWmsServiceLayer = async ({
  wmsServiceId,
  name = null,
  label = null,
  queryable = null,
  legend_url = null,
  legend_image = null,
}) => {
  const db = store.get(pgliteDbAtom)
  const wms_service_layer_id = uuidv7()
  await db.query(
    `INSERT INTO wms_service_layers (wms_service_layer_id, wms_service_id, name, label, queryable, legend_url, legend_image) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      wms_service_layer_id,
      wmsServiceId,
      name,
      label,
      queryable,
      legend_url,
      legend_image,
    ],
  )

  store.set(addOperationAtom, {
    table: 'wms_service_layers',
    operation: 'insert',
    draft: {
      wms_service_layer_id,
      wms_service_id: wmsServiceId,
      name,
      label,
      queryable,
      legend_url,
      legend_image,
    },
  })

  return wms_service_layer_id
}

export const createChart = async ({
  projectId = null,
  subprojectId = null,
  placeId = null,
}) => {
  const db = store.get(pgliteDbAtom)
  const chart_id = uuidv7()
  await db.query(
    `INSERT INTO charts (chart_id, account_id, project_id, subproject_id, place_id) VALUES ($1, $2, $3, $4, $5)`,
    [
      chart_id,
      '018cf958-27e2-7000-90d3-59f024d467be',
      projectId,
      subprojectId,
      placeId,
    ],
  )

  store.set(addOperationAtom, {
    table: 'charts',
    operation: 'insert',
    draft: {
      chart_id,
      account_id,
      project_id: projectId,
      subproject_id: subprojectId,
      place_id: placeId,
    },
  })

  return chart_id
}

export const createSubprojectReportDesign = async ({ projectId }) => {
  const db = store.get(pgliteDbAtom)
  const subproject_report_design_id = uuidv7()

  // If no subproject_report_design in this project is active yet, set it active
  const existingRes = await db.query(
    `SELECT 1 FROM subproject_report_designs WHERE project_id = $1 AND active = TRUE LIMIT 1`,
    [projectId],
  )
  const active = existingRes.rows.length === 0

  await db.query(
    `INSERT INTO subproject_report_designs (subproject_report_design_id, account_id, project_id, active) VALUES ($1, $2, $3, $4)
     ON CONFLICT (subproject_report_design_id) DO NOTHING`,
    [subproject_report_design_id, account_id, projectId, active],
  )

  store.set(addOperationAtom, {
    table: 'subproject_report_designs',
    operation: 'insert',
    draft: {
      subproject_report_design_id,
      account_id,
      project_id: projectId,
      active,
    },
  })

  return subproject_report_design_id
}

export const createProjectReportDesign = async ({ projectId }) => {
  const db = store.get(pgliteDbAtom)
  const project_report_design_id = uuidv7()

  // If no project_report_design in this project is active yet, set it active
  const existingRes = await db.query(
    `SELECT 1 FROM project_report_designs WHERE project_id = $1 AND active = TRUE LIMIT 1`,
    [projectId],
  )
  const active = existingRes.rows.length === 0

  await db.query(
    `INSERT INTO project_report_designs (project_report_design_id, account_id, project_id, active) VALUES ($1, $2, $3, $4)
     ON CONFLICT (project_report_design_id) DO NOTHING`,
    [project_report_design_id, account_id, projectId, active],
  )

  store.set(addOperationAtom, {
    table: 'project_report_designs',
    operation: 'insert',
    draft: {
      project_report_design_id,
      account_id,
      project_id: projectId,
      active,
    },
  })

  return project_report_design_id
}

export const createChartSubject = async ({ chartId }) => {
  const db = store.get(pgliteDbAtom)
  const chart_subject_id = uuidv7()

  await db.query(
    `INSERT INTO chart_subjects (chart_subject_id, account_id, chart_id, type, stroke, fill, fill_graded, connect_nulls) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      chart_subject_id,
      account_id,
      chartId,
      'monotone',
      '#FF0000',
      '#ffffff',
      true,
      true,
    ],
  )

  store.set(addOperationAtom, {
    table: 'chart_subjects',
    operation: 'insert',
    draft: {
      chart_subject_id,
      account_id,
      chart_id: chartId,
      type: 'monotone',
      stroke: '#FF0000',
      fill: '#ffffff',
      fill_graded: true,
      connect_nulls: true,
    },
  })

  return chart_subject_id
}

export const createObservationImport = async ({ subprojectId }) => {
  const db = store.get(pgliteDbAtom)
  const observation_import_id = uuidv7()
  const date = new Date()

  await db.query(
    `INSERT INTO observation_imports (observation_import_id, account_id, subproject_id, geometry_method, crs, created_time, download_from_gbif) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (observation_import_id) DO NOTHING`,
    [
      observation_import_id,
      '018cf958-27e2-7000-90d3-59f024d467be',
      subprojectId,
      'coordinates',
      'EPSG:4326',
      date,
      false,
    ],
  )

  store.set(addOperationAtom, {
    table: 'observation_imports',
    operation: 'insert',
    draft: {
      observation_import_id,
      account_id,
      subproject_id: subprojectId,
      geometry_method: 'coordinates',
      crs: 'EPSG:4326',
      created_time: date,
      download_from_gbif: false,
    },
  })

  return observation_import_id
}

// no insert as this data is inserted in bulk
export const createObservation = ({ observationImportId, data = null }) => ({
  observation_id: uuidv7(),
  account_id,
  observation_import_id: observationImportId,
  data,
})

export const createQc = async () => {
  const db = store.get(pgliteDbAtom)
  const qcs_id = uuidv7()
  await db.query(`insert into qcs (qcs_id) values ($1)`, [qcs_id])

  store.set(addOperationAtom, {
    table: 'qcs',
    operation: 'insert',
    draft: { qcs_id },
  })

  return qcs_id
}

export const createSubprojectQc = async ({ subprojectId, qcId }) => {
  const db = store.get(pgliteDbAtom)
  const qcs_assignment_id = uuidv7()
  await db.query(
    `insert into qcs_assignment (qcs_assignment_id, subproject_id, qc_id) values ($1, $2, $3)`,
    [qcs_assignment_id, subprojectId, qcId],
  )

  store.set(addOperationAtom, {
    table: 'qcs_assignment',
    operation: 'insert',
    draft: { qcs_assignment_id, subproject_id: subprojectId, qc_id: qcId },
  })

  return qcs_assignment_id
}

export const createRootQcsAssignment = async ({ qcId }) => {
  const db = store.get(pgliteDbAtom)
  const qcs_assignment_id = uuidv7()
  await db.query(
    `insert into qcs_assignment (qcs_assignment_id, qc_id) values ($1, $2)`,
    [qcs_assignment_id, qcId],
  )

  store.set(addOperationAtom, {
    table: 'qcs_assignment',
    operation: 'insert',
    draft: { qcs_assignment_id, qc_id: qcId },
  })

  return qcs_assignment_id
}

export const createProjectQcsAssignment = async ({ projectId, qcId }) => {
  const db = store.get(pgliteDbAtom)
  const qcs_assignment_id = uuidv7()
  await db.query(
    `insert into qcs_assignment (qcs_assignment_id, project_id, qc_id) values ($1, $2, $3)`,
    [qcs_assignment_id, projectId, qcId],
  )

  store.set(addOperationAtom, {
    table: 'qcs_assignment',
    operation: 'insert',
    draft: { qcs_assignment_id, project_id: projectId, qc_id: qcId },
  })

  return qcs_assignment_id
}
