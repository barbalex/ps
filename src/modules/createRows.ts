import { uuidv7 } from '@kripod/uuidv7'

import { addOperationAtom, store } from '../store.ts'

// TODO: run insert query?
const getPresetData = async ({ db, projectId = null, table }) => {
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
export const createProject = async ({ db }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({ db, table: 'projects' })

  const data = {
    project_id: uuidv7(),
    account_id: '018cf958-27e2-7000-90d3-59f024d467be', // TODO: replace with auth data when implemented
    type: 'species',
    subproject_name_singular: 'Art',
    subproject_name_plural: 'Arten',
    values_on_multiple_levels: 'first',
    multiple_action_values_on_same_level: 'all',
    multiple_check_values_on_same_level: 'last',
    files_active_projects: true,
    files_active_subprojects: true,
    files_active_places: true,
    files_active_actions: true,
    files_active_checks: true,

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

  return store.set(addOperationAtom, {
    table: 'projects',
    operation: 'insert',
    draft: data,
  })
}

export const createSubproject = async ({ db, projectId }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    projectId,
    table: 'subprojects',
  })

  const data = {
    subproject_id: uuidv7(),
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

  return store.set(addOperationAtom, {
    table: 'subprojects',
    operation: 'insert',
    draft: data,
  })
}

export const createFile = async ({
  db,
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
  // find fields with preset values on the data column
  const presetData = await getPresetData({ db, table: 'files' })

  const data = {
    file_id: uuidv7(),
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

  return store.set(addOperationAtom, {
    table: 'files',
    operation: 'insert',
    draft: data,
  })
}

export const createPlace = async ({
  db,
  projectId,
  subprojectId,
  parentId,
  level,
}) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    projectId,
    table: 'places',
  })

  const data = {
    place_id: uuidv7(),
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

  return store.set(addOperationAtom, {
    table: 'places',
    operation: 'insert',
    draft: data,
  })
}

export const createWidgetForField = async ({ db }) => {
  const widget_for_field_id = uuidv7()
  await db.query(
    `insert into widgets_for_fields (widget_for_field_id) values ($1)`,
    [widget_for_field_id],
  )

  return store.set(addOperationAtom, {
    table: 'widgets_for_fields',
    operation: 'insert',
    draft: { widget_for_field_id },
  })
}

export const createWidgetType = async ({ db }) => {
  const widget_type_id = uuidv7()
  await db.query(
    `insert into widget_types (widget_type_id, needs_list, sort) values ($1, $2, $3)`,
    [widget_type_id, false, 0],
  )

  return store.set(addOperationAtom, {
    table: 'widget_types',
    operation: 'insert',
    draft: { widget_type_id, needs_list: false, sort: 0 },
  })
}

export const createFieldType = async ({ db }) => {
  const field_type_id = uuidv7()
  await db.query(
    `insert into field_types (field_type_id, sort) values ($1, $2) returning field_type_id`,
    [field_type_id, 0],
  )
  return store.set(addOperationAtom, {
    table: 'field_types',
    operation: 'insert',
    draft: { field_type_id, sort: 0 },
  })
}

export const createAccount = async ({ db }) => {
  const account_id = uuidv7()
  await db.query(`insert into accounts (account_id, type) values ($1, $2)`, [
    account_id,
    'free',
  ])

  return store.set(addOperationAtom, {
    table: 'accounts',
    operation: 'insert',
    draft: { account_id, type: 'free' },
  })
}

// users creates the db row to ensure creating the app_state too
export const createUser = async ({ db, setUserId }) => {
  const user_id = uuidv7()

  // TODO: why setUserId?
  setUserId(user_id)

  await db.query(`INSERT INTO users (user_id) VALUES ($1)`, [user_id])

  return store.set(addOperationAtom, {
    table: 'users',
    operation: 'insert',
    draft: { user_id },
  })
}

export const createPerson = async ({ db, projectId }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    projectId,
    table: 'persons',
  })

  const data = {
    person_id: uuidv7(),
    project_id: projectId,

    ...presetData,
  }

  const columns = Object.keys(data).join(',')
  const values = Object.values(data)
    .map((_, i) => `$${i + 1}`)
    .join(',')

  await db.query(
    `insert into persons (${columns}) values (${values})`,
    Object.values(data),
  )

  return store.set(addOperationAtom, {
    table: 'persons',
    operation: 'insert',
    draft: data,
  })
}

export const createCrs = async ({ db }) => {
  const crs_id = uuidv7()
  await db.query(`insert into crs (crs_id) values ($1)`, [crs_id])
  return store.set(addOperationAtom, {
    table: 'crs',
    operation: 'insert',
    draft: { crs_id },
  })
}

export const createProjectCrs = async ({ projectId, db }) => {
  const project_crs_id = uuidv7()
  await db.query(
    `insert into project_crs (project_crs_id, project_id) values ($1, $2)`,
    [project_crs_id, projectId],
  )

  return store.set(addOperationAtom, {
    table: 'project_crs',
    operation: 'insert',
    draft: { project_crs_id, project_id: projectId },
  })
}

export const createField = async ({
  projectId = null,
  table_name = null,
  level = null,
  db,
}) => {
  const field_id = uuidv7()
  await db.query(
    `insert into fields (field_id, project_id, table_name, level, field_type_id, widget_type_id) values ($1, $2, $3, $4, $5, $6)`,
    [
      field_id,
      projectId,
      table_name,
      level,
      '018ca19e-7a23-7bf4-8523-ff41e3b60807',
      '018ca1a0-f187-7fdf-955b-4eaadaa92553',
    ],
  )

  return store.set(addOperationAtom, {
    table: 'fields',
    operation: 'insert',
    draft: {
      field_id,
      project_id: projectId,
      table_name,
      level,
      field_type_id: '018ca19e-7a23-7bf4-8523-ff41e3b60807',
      widget_type_id: '018ca1a0-f187-7fdf-955b-4eaadaa92553',
    },
  })
}

export const createUnit = async ({ projectId, db }) => {
  const unit_id = uuidv7()
  await db.query(
    `INSERT INTO units (unit_id, project_id, use_for_action_values, use_for_action_report_values, use_for_check_values, use_for_place_report_values, use_for_goal_report_values, use_for_subproject_taxa, use_for_check_taxa, summable, sort, type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      unit_id,
      projectId,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
      0,
      'integer',
    ],
  )

  return store.set(addOperationAtom, {
    table: 'units',
    operation: 'insert',
    draft: {
      unit_id,
      project_id: projectId,
      use_for_action_values: true,
      use_for_action_report_values: true,
      use_for_check_values: true,
      use_for_place_report_values: true,
      use_for_goal_report_values: true,
      use_for_subproject_taxa: true,
      use_for_check_taxa: true,
      summable: false,
      sort: 0,
      type: 'integer',
    },
  })
}

export const createList = async ({ db, projectId, name = null }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({ db, projectId, table: 'lists' })

  const data = {
    list_id: uuidv7(),
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

  return store.set(addOperationAtom, {
    table: 'lists',
    operation: 'insert',
    draft: data,
  })
}

export const createTaxonomy = async ({ db, projectId }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    projectId,
    table: 'taxonomies',
  })

  const data = {
    taxonomy_id: uuidv7(),
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

  return store.set(addOperationAtom, {
    table: 'taxonomies',
    operation: 'insert',
    draft: data,
  })
}

export const createProjectUser = async ({ projectId, db }) => {
  const project_user_id = uuidv7()
  await db.query(
    `insert into project_users (project_user_id, project_id, role) values ($1, $2, $3)`,
    [project_user_id, projectId, 'reader'],
  )

  return store.set(addOperationAtom, {
    table: 'project_users',
    operation: 'insert',
    draft: {
      project_user_id,
      project_id: projectId,
      role: 'reader',
    },
  })
}

export const createProjectReport = async ({ db, projectId }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    projectId,
    table: 'project_reports',
  })

  const data = {
    project_report_id: uuidv7(),
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

  return store.set(addOperationAtom, {
    table: 'project_reports',
    operation: 'insert',
    draft: data,
  })
}

export const createPlaceLevel = async ({ db }) => {
  const place_level_id = uuidv7()
  await db.query(
    `insert into place_levels (place_level_id, level, reports, report_values, actions, action_values, action_reports, checks, check_values, check_taxa, occurrences) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [place_level_id, 1, true, true, true, true, true, true, true, true, true],
  )

  return store.set(addOperationAtom, {
    table: 'place_levels',
    operation: 'insert',
    draft: {
      place_level_id,
      level: 1,
      reports: true,
      report_values: true,
      actions: true,
      action_values: true,
      action_reports: true,
      checks: true,
      check_values: true,
      check_taxa: true,
      occurrences: true,
    },
  })
}

export const createTaxon = async ({ taxonomyId, db }) => {
  const taxon_id = uuidv7()
  await db.query(`insert into taxa (taxon_id, taxonomy_id) values ($1, $2)`, [
    taxon_id,
    taxonomyId,
  ])

  return store.set(addOperationAtom, {
    table: 'taxa',
    operation: 'insert',
    draft: { taxon_id, taxonomy_id: taxonomyId },
  })
}

export const createListValue = async ({ listId, db }) => {
  const list_value_id = uuidv7()
  await db.query(
    `
    insert into list_values (list_value_id, account_id, list_id, obsolete) 
    values ($1, $2, $3, $4)`,
    [list_value_id, '018cf958-27e2-7000-90d3-59f024d467be', listId, false],
  )

  return store.set(addOperationAtom, {
    table: 'list_values',
    operation: 'insert',
    draft: {
      list_value_id,
      account_id: '018cf958-27e2-7000-90d3-59f024d467be',
      list_id: listId,
      obsolete: false,
    },
  })
}

export const createGoal = async ({ db, projectId, subprojectId }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    projectId,
    table: 'goals',
  })

  const data = {
    goal_id: uuidv7(),
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

  return store.set(addOperationAtom, {
    table: 'goals',
    operation: 'insert',
    draft: data,
  })
}

export const createGoalReport = async ({ db, projectId, goalId }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    projectId,
    table: 'goal_reports',
  })

  const goal_report_id = uuidv7()
  const data = {
    goal_report_id,
    goal_id: goalId,
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

export const createGoalReportValue = async ({ db, goalReportId }) => {
  const goal_report_value_id = uuidv7()
  await db.query(
    `insert into goal_report_values (goal_report_value_id, goal_report_id) values ($1, $2)`,
    [goal_report_value_id, goalReportId],
  )

  return store.set(addOperationAtom, {
    table: 'goal_report_values',
    operation: 'insert',
    draft: {
      goal_report_value_id,
      goal_report_id: goalReportId,
    },
  })
}

export const createSubprojectUser = async ({ db, subprojectId }) => {
  const subproject_user_id = uuidv7()
  await db.query(
    `insert into subproject_users (subproject_user_id, subproject_id, role) values ($1, $2, $3)`,
    [subproject_user_id, subprojectId, 'reader'],
  )

  return store.set(addOperationAtom, {
    table: 'subproject_users',
    operation: 'insert',
    draft: {
      subproject_user_id,
      subproject_id: subprojectId,
      role: 'reader',
    },
  })
}

export const createPlaceUser = async ({ placeId, db }) => {
  const place_user_id = uuidv7()
  await db.query(
    `insert into place_users (place_user_id, place_id, role) values ($1, $2, $3)`,
    [place_user_id, placeId, 'reader'],
  )

  return store.set(addOperationAtom, {
    table: 'place_users',
    operation: 'insert',
    draft: {
      place_user_id,
      place_id: placeId,
      role: 'reader',
    },
  })
}

export const createSubprojectTaxon = async ({ db, subprojectId }) => {
  const subproject_taxon_id = uuidv7()
  await db.query(
    `insert into subproject_taxa (subproject_taxon_id, subproject_id) values ($1, $2)`,
    [subproject_taxon_id, subprojectId],
  )

  return store.set(addOperationAtom, {
    table: 'subproject_taxa',
    operation: 'insert',
    draft: {
      subproject_taxon_id,
      subproject_id: subprojectId,
    },
  })
}

export const createSubprojectReport = async ({
  db,
  projectId,
  subprojectId,
}) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    projectId,
    table: 'subproject_reports',
  })

  const data = {
    subproject_report_id: uuidv7(),
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

  return store.set(addOperationAtom, {
    table: 'subproject_reports',
    operation: 'insert',
    draft: data,
  })
}

export const createCheck = async ({ db, projectId, placeId }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    projectId,
    table: 'checks',
  })

  const data = {
    check_id: uuidv7(),
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

  return store.set(addOperationAtom, {
    table: 'checks',
    operation: 'insert',
    draft: data,
  })
}

export const createCheckValue = async ({ db, checkId }) => {
  const check_value_id = uuidv7()
  await db.query(
    `insert into check_values (check_value_id, check_id) values ($1, $2)`,
    [check_value_id, checkId],
  )

  return store.set(addOperationAtom, {
    table: 'check_values',
    operation: 'insert',
    draft: {
      check_value_id,
      check_id: checkId,
    },
  })
}

export const createCheckTaxon = async ({ db, checkId }) => {
  const check_taxon_id = uuidv7()
  await db.query(
    `insert into check_taxa (check_taxon_id, check_id) values ($1, $2)`,
    [check_taxon_id, checkId],
  )

  return store.set(addOperationAtom, {
    table: 'check_taxa',
    operation: 'insert',
    draft: {
      check_taxon_id,
      check_id: checkId,
    },
  })
}

export const createAction = async ({ db, projectId, placeId }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({ db, projectId, table: 'actions' })

  const data = {
    action_id: uuidv7(),
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

  return store.set(addOperationAtom, {
    table: 'actions',
    operation: 'insert',
    draft: data,
  })
}

export const createActionValue = async ({ db, actionId }) => {
  const action_value_id = uuidv7()
  await db.query(
    `insert into action_values (action_value_id, action_id) values ($1, $2)`,
    [action_value_id, actionId],
  )

  return store.set(addOperationAtom, {
    table: 'action_values',
    operation: 'insert',
    draft: {
      action_value_id,
      action_id: actionId,
    },
  })
}

export const createActionReport = async ({ db, projectId, actionId }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    projectId,
    table: 'action_reports',
  })

  const data = {
    action_report_id: uuidv7(),
    action_id: actionId,
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

  return store.set(addOperationAtom, {
    table: 'action_reports',
    operation: 'insert',
    draft: data,
  })
}

export const createActionReportValue = async ({ db, actionReportId }) => {
  const action_report_value_id = uuidv7()
  await db.query(
    `insert into action_report_values (action_report_value_id, action_report_id) values ($1, $2)`,
    [action_report_value_id, actionReportId],
  )

  return store.set(addOperationAtom, {
    table: 'action_report_values',
    operation: 'insert',
    draft: {
      action_report_value_id,
      action_report_id: actionReportId,
    },
  })
}

export const createPlaceReport = async ({ db, projectId, placeId }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    projectId,
    table: 'place_reports',
  })

  const data = {
    place_report_id: uuidv7(),
    place_id: placeId,
    year: new Date().getFullYear(),
    ...presetData,
  }

  const columns = Object.keys(data).join(',')
  const values = Object.values(data)
    .map((_, i) => `$${i + 1}`)
    .join(',')

  await db.query(
    `insert into place_reports (${columns}) values (${values})`,
    Object.values(data),
  )

  return store.set(addOperationAtom, {
    table: 'place_reports',
    operation: 'insert',
    draft: data,
  })
}

export const createPlaceReportValue = async ({ placeReportId, db }) => {
  const place_report_value_id = uuidv7()
  await db.query(
    `insert into place_report_values (place_report_value_id, place_report_id) values ($1, $2)`,
    [place_report_value_id, placeReportId],
  )

  return store.set(addOperationAtom, {
    table: 'place_report_values',
    operation: 'insert',
    draft: {
      place_report_value_id,
      place_report_id: placeReportId,
    },
  })
}

export const createMessage = async ({ db }) => {
  const message_id = uuidv7()
  const date = new Date()

  await db.query(`insert into messages (message_id, date) values ($1, $2)`, [
    message_id,
    date,
  ])

  return store.set(addOperationAtom, {
    table: 'messages',
    operation: 'insert',
    draft: {
      message_id,
      date,
    },
  })
}

export const createWmsLayer = async ({ projectId, db }) => {
  const wms_layer_id = uuidv7()
  await db.query(
    `INSERT INTO wms_layers (wms_layer_id, project_id) VALUES ($1, $2)`,
    [wms_layer_id, projectId],
  )

  return store.set(addOperationAtom, {
    table: 'wms_layers',
    operation: 'insert',
    draft: {
      wms_layer_id,
      project_id: projectId,
    },
  })
}

export const createVectorLayer = ({
  projectId,
  type = null,
  ownTable = null,
  ownTableLevel = null,
  label = null,
  maxFeatures = 1000,
  db,
}) =>
  db.query(
    `insert into vector_layers (vector_layer_id, project_id, label, type, own_table, own_table_level, max_features) values ($1, $2, $3, $4, $5, $6, $7) returning vector_layer_id`,
    [uuidv7(), projectId, label, type, ownTable, ownTableLevel, maxFeatures],
  )

export const createWfsService = async ({
  projectId = null,
  url = null,
  version = null,
  info_formats = null,
  info_format = null,
  default_crs = null,
  db,
}) =>
  db.query(
    `insert into wfs_services (wfs_service_id, project_id, version, url, info_formats, info_format, default_crs) values ($1, $2, $3, $4, $5, $6, $7) returning wfs_service_id`,
    [uuidv7(), projectId, version, url, info_formats, info_format, default_crs],
  )

export const createWfsServiceLayer = async ({
  wfsServiceId,
  name = null,
  label = null,
  db,
}) =>
  db.query(
    `insert into wfs_service_layers (wfs_service_layer_id, wfs_service_id, name, label) values ($1, $2, $3, $4) returning wfs_service_layer_id`,
    [uuidv7(), wfsServiceId, name, label],
  )

export const createVectorLayerDisplay = async ({
  vectorLayerId = null,
  displayPropertyValue = null,
  db,
}) =>
  db.query(
    `
    insert into vector_layer_displays 
    (vector_layer_display_id, vector_layer_id, display_property_value, marker_type, circle_marker_radius, marker_size, stroke, color, weight, line_cap, line_join, fill, fill_color, fill_opacity_percent, fill_rule)
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    returning vector_layer_display_id
  `,
    [
      uuidv7(),
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

export const createLayerPresentation = async ({
  vectorLayerId = null,
  wmsLayerId = null,
  accountId = null,
  active = false,
  transparent = false,
  db,
}) =>
  db.query(
    `
    INSERT INTO layer_presentations
    (layer_presentation_id, account_id, vector_layer_id, wms_layer_id, active, opacity_percent, grayscale, transparent, max_zoom, min_zoom)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING layer_presentation_id
  `,
    [
      uuidv7(),
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

export const createWmsService = async ({
  projectId = null,
  url = null,
  image_formats = null,
  image_format = null,
  version = null,
  info_formats = null,
  info_format = null,
  default_crs = null,
  db,
}) =>
  db.query(
    `INSERT INTO wms_services (wms_service_id, project_id, version, url, image_formats, image_format, info_formats, info_format, default_crs) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *`,
    [
      uuidv7(),
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

// not in use - multiple insert used instead
export const createWmsServiceLayer = async ({
  wmsServiceId,
  name = null,
  label = null,
  queryable = null,
  legend_url = null,
  legend_image = null,
  db,
}) =>
  db.query(
    `INSERT INTO wms_service_layers (wms_service_layer_id, wms_service_id, name, label, queryable, legend_url, legend_image) VALUES ($1, $2, $3, $4, $5, $6, $7) returning *`,
    [uuidv7(), wmsServiceId, name, label, queryable, legend_url, legend_image],
  )

export const createChart = async ({
  projectId = null,
  subprojectId = null,
  placeId = null,
  db,
}) =>
  db.query(
    `INSERT INTO charts (chart_id, account_id, project_id, subproject_id, place_id) VALUES ($1, $2, $3, $4, $5) returning chart_id`,
    [
      uuidv7(),
      '018cf958-27e2-7000-90d3-59f024d467be',
      projectId,
      subprojectId,
      placeId,
    ],
  )

export const createChartSubject = async ({ chartId, db }) =>
  db.query(
    `INSERT INTO chart_subjects (chart_subject_id, account_id, chart_id, type, stroke, fill, fill_graded, connect_nulls) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning chart_subject_id`,
    [
      uuidv7(),
      '018cf958-27e2-7000-90d3-59f024d467be',
      chartId,
      'monotone',
      '#FF0000',
      '#ffffff',
      true,
      true,
    ],
  )

export const createOccurrenceImport = async ({ subprojectId, db }) =>
  db.query(
    `INSERT INTO occurrence_imports (occurrence_import_id, account_id, subproject_id, geometry_method, crs, created_time, download_from_gbif) VALUES ($1, $2, $3, $4, $5, $6, $7) returning occurrence_import_id`,
    [
      uuidv7(),
      '018cf958-27e2-7000-90d3-59f024d467be',
      subprojectId,
      'coordinates',
      'EPSG:4326',
      Date.now(),
      false,
    ],
  )

// no insert as this data is inserted in bulk
export const createOccurrence = ({ occurrenceImportId, data = null }) => ({
  occurrence_id: uuidv7(),
  account_id: '018cf958-27e2-7000-90d3-59f024d467be', // TODO: replace with auth data when implemented
  occurrence_import_id: occurrenceImportId,
  data,
})

export const createNotification = async ({
  title = null,
  body = null,
  // 'success' | 'error' | 'warning' | 'info'
  intent = 'info',
  timeout = 10000,
  paused = null,
  db,
}) =>
  db.query(
    `INSERT INTO notifications (notification_id, title, body, intent, timeout, paused) VALUES ($1, $2, $3, $4, $5, $6) returning notification_id`,
    [uuidv7(), title, body, intent, timeout, paused],
  )
