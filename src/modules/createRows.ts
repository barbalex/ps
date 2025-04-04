import { uuidv7 } from '@kripod/uuidv7'

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

  return db.query(
    `insert into projects (${columns}) values (${values}) returning project_id`,
    Object.values(data),
  )
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
  return db.query(
    `insert into subprojects (${columns}) values (${values}) returning subproject_id`,
    Object.values(data),
  )
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

  return db.query(
    `insert into files (${columns}) values (${values}) returning file_id`,
    Object.values(data),
  )
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

  return db.query(
    `insert into places (${columns}) values (${values}) returning place_id`,
    Object.values(data),
  )
}

export const createWidgetForField = async ({ db }) =>
  db.query(
    `insert into widgets_for_fields (widget_for_field_id) values ($1) returning widget_for_field_id`,
    [uuidv7()],
  )

export const createWidgetType = async ({ db }) =>
  db.query(
    `insert into widget_types (widget_type_id, needs_list, sort) values ($1, $2, $3) returning widget_type_id`,
    [uuidv7(), false, 0],
  )

export const createFieldType = async ({ db }) =>
  db.query(
    `insert into field_types (field_type_id, sort) values ($1, $2) returning field_type_id`,
    [uuidv7(), 0],
  )

export const createAccount = async ({ db }) =>
  db.query(
    `insert into accounts (account_id, type) values ($1, $2) returning account_id`,
    [uuidv7(), 'free'],
  )

// users creates the db row to ensure creating the app_state too
export const createUser = async ({ db, setUserId }) => {
  const user_id = uuidv7()

  // TODO: why setUserId?
  setUserId(user_id)

  return db.query(`INSERT INTO users (user_id) VALUES ($1) returning user_id`, [
    user_id,
  ])
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

  return db.query(
    `insert into persons (${columns}) values (${values}) returning person_id`,
    Object.values(data),
  )
}

export const createCrs = async ({ db }) =>
  db.query(`insert into crs (crs_id) values ($1) returning crs_id`, [uuidv7()])

export const createProjectCrs = async ({ projectId, db }) =>
  db.query(
    `insert into project_crs (project_crs_id, project_id) values ($1, $2) returning project_crs_id`,
    [uuidv7(), projectId],
  )

export const createField = async ({
  projectId = null,
  table_name = null,
  level = null,
  db,
}) =>
  db.query(
    `insert into fields (field_id, project_id, table_name, level, field_type_id, widget_type_id) values ($1, $2, $3, $4, $5, $6) returning field_id`,
    [
      uuidv7(),
      projectId,
      table_name,
      level,
      '018ca19e-7a23-7bf4-8523-ff41e3b60807',
      '018ca1a0-f187-7fdf-955b-4eaadaa92553',
    ],
  )

export const createUnit = async ({ projectId, db }) =>
  db.query(
    `INSERT INTO units (unit_id, project_id, use_for_action_values, use_for_action_report_values, use_for_check_values, use_for_place_report_values, use_for_goal_report_values, use_for_subproject_taxa, use_for_check_taxa, summable, sort, type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) returning unit_id`,
    [
      uuidv7(),
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

  return db.query(
    `insert into lists (${columns}) values (${values}) returning list_id`,
    Object.values(data),
  )
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
  return db.query(
    `insert into taxonomies (${columns}) values (${values}) returning taxonomy_id`,
    Object.values(data),
  )
}

export const createProjectUser = async ({ projectId, db }) =>
  db.query(
    `insert into project_users (project_user_id, project_id, role) values ($1, $2, $3) returning project_user_id`,
    [uuidv7(), projectId, 'reader'],
  )

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

  return db.query(
    `insert into project_reports (${columns}) values (${values}) returning project_report_id`,
    Object.values(data),
  )
}

export const createPlaceLevel = async ({ db }) =>
  db.query(
    `insert into place_levels (place_level_id, level, reports, report_values, actions, action_values, action_reports, checks, check_values, check_taxa, occurrences) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning place_level_id`,
    [uuidv7(), 1, true, true, true, true, true, true, true, true, true],
  )

export const createTaxon = async ({ taxonomyId, db }) =>
  db.query(
    `insert into taxa (taxon_id, taxonomy_id) values ($1, $2) returning taxon_id`,
    [uuidv7(), taxonomyId],
  )

export const createListValue = async ({ listId, db }) =>
  db.query(
    `
    insert into list_values (list_value_id, account_id, list_id, obsolete) 
    values ($1, $2, $3, $4) 
    returning list_value_id`,
    [uuidv7(), '018cf958-27e2-7000-90d3-59f024d467be', listId, false],
  )

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

  return db.query(
    `insert into goals (${columns}) values (${values}) returning goal_id`,
    Object.values(data),
  )
}

export const createGoalReport = async ({ db, projectId, goalId }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    projectId,
    table: 'goal_reports',
  })

  const data = {
    goal_report_id: uuidv7(),
    goal_id: goalId,
    ...presetData,
  }
  const columns = Object.keys(data).join(',')
  const values = Object.values(data)
    .map((_, i) => `$${i + 1}`)
    .join(',')
  const sql = `insert into goal_reports (${columns}) values (${values}) returning goal_report_id`

  // TODO: invalid input syntax for type json
  let res
  try {
    res = await db.query(sql, Object.values(data))
  } catch (error) {
    console.log('createGoalReport', error)
  }

  return res
}

export const createGoalReportValue = async ({ db, goalReportId }) =>
  db.query(
    `insert into goal_report_values (goal_report_value_id, goal_report_id) values ($1, $2) returning goal_report_value_id`,
    [uuidv7(), goalReportId],
  )

export const createSubprojectUser = async ({ db, subprojectId }) =>
  db.query(
    `insert into subproject_users (subproject_user_id, subproject_id, role) values ($1, $2, $3) returning subproject_user_id`,
    [uuidv7(), subprojectId, 'reader'],
  )

export const createPlaceUser = async ({ placeId, db }) =>
  db.query(
    `insert into place_users (place_user_id, place_id, role) values ($1, $2, $3) returning place_user_id`,
    [uuidv7(), placeId, 'reader'],
  )

export const createSubprojectTaxon = async ({ db, subprojectId }) =>
  db.query(
    `insert into subproject_taxa (subproject_taxon_id, subproject_id) values ($1, $2) returning subproject_taxon_id`,
    [uuidv7(), subprojectId],
  )

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

  return db.query(
    `insert into subproject_reports (${columns}) values (${values}) returning subproject_report_id`,
    Object.values(data),
  )
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

  return db.query(
    `insert into checks (${columns}) values (${values}) returning check_id`,
    Object.values(data),
  )
}

export const createCheckValue = async ({ db, checkId }) =>
  db.query(
    `insert into check_values (check_value_id, check_id) values ($1, $2) returning check_value_id`,
    [uuidv7(), checkId],
  )

export const createCheckTaxon = async ({ db, checkId }) =>
  db.query(
    `insert into check_taxa (check_taxon_id, check_id) values ($1, $2) returning check_taxon_id`,
    [uuidv7(), checkId],
  )

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

  return db.query(
    `insert into actions (${columns}) values (${values}) returning action_id`,
    Object.values(data),
  )
}

export const createActionValue = async ({ db, actionId }) =>
  db.query(
    `insert into action_values (action_value_id, action_id) values ($1, $2) returning action_value_id`,
    [uuidv7(), actionId],
  )

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

  return db.query(
    `insert into action_reports (${columns}) values (${values}) returning action_report_id`,
    Object.values(data),
  )
}

export const createActionReportValue = async ({ db, actionReportId }) =>
  db.query(
    `insert into action_report_values (action_report_value_id, action_report_id) values ($1, $2) returning action_report_value_id`,
    [uuidv7(), actionReportId],
  )

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

  return db.query(
    `insert into place_reports (${columns}) values (${values}) returning place_report_id`,
    Object.values(data),
  )
}

export const createPlaceReportValue = async ({ placeReportId, db }) =>
  db.query(
    `insert into place_report_values (place_report_value_id, place_report_id) values ($1, $2) returning place_report_value_id`,
    [uuidv7(), placeReportId],
  )

export const createMessage = async ({ db }) =>
  db.query(
    `insert into messages (message_id, date) values ($1, $2) returning message_id`,
    [uuidv7(), new Date()],
  )

export const createWmsLayer = async ({ projectId, db }) =>
  db.query(
    `INSERT INTO wms_layers (wms_layer_id, project_id) VALUES ($1, $2) returning wms_layer_id`,
    [uuidv7(), projectId],
  )

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
