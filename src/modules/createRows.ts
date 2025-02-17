import { uuidv7 } from '@kripod/uuidv7'

// TODO: run insert query?
const getPresetData = async ({ db, project_id = null, table }) => {
  const fieldsWithPresetsResult = await db.query(
    `select * from fields where project_id = $1 and table_name = $2 and preset is not null`,
    [project_id, table],
  )
  const fieldsWithPresets = fieldsWithPresetsResult.rows ?? []
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

  return {
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
}

export const createSubproject = async ({ db, project_id }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    project_id,
    table: 'subprojects',
  })

  return {
    subproject_id: uuidv7(),
    project_id,

    ...presetData,
  }
}

export const createFile = async ({
  db,
  project_id = null,
  subproject_id = null,
  place_id = null,
  action_id = null,
  check_id = null,
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

  return {
    file_id: uuidv7(),
    project_id,
    subproject_id,
    place_id,
    action_id,
    check_id,

    name,
    size,
    mimetype,
    url,
    uuid,
    width,
    height,
    ...presetData,
  }
}

export const createPlace = async ({
  db,
  project_id,
  subproject_id,
  parent_id,
  level,
}) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    project_id,
    table: 'places',
  })

  return {
    place_id: uuidv7(),
    subproject_id,
    parent_id,
    level,

    ...presetData,
  }
}

export const createWidgetForField = () => ({
  widget_for_field_id: uuidv7(),
})

export const createWidgetType = () => ({
  widget_type_id: uuidv7(),
  needs_list: false,
  sort: 0,
})

export const createFieldType = () => ({
  field_type_id: uuidv7(),
  sort: 0,
})

export const createAccount = () => ({
  account_id: uuidv7(),
  type: 'free',
})

// users creates the db row to ensure creating the app_state too
export const createUser = async ({ db, setUserId }) => {
  const user_id = uuidv7()

  const sql = `INSERT INTO users (user_id) VALUES ($1)`
  await db.query(sql, [user_id])
  // TODO: why setUserId?
  setUserId(user_id)

  return data
}

export const createPerson = async ({ db, project_id }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    project_id,
    table: 'persons',
  })

  return {
    person_id: uuidv7(),
    project_id,

    ...presetData,
  }
}

export const createCrs = () => ({
  crs_id: uuidv7(),
})

export const createProjectCrs = async ({ project_id, db }) =>
  db.query(
    `insert into project_crs (project_crs_id, project_id) values ($1, $2) returning project_crs_id`,
    [uuidv7(), project_id],
  )

export const createField = ({
  project_id = null,
  table_name = null,
  level = null,
}) => ({
  field_id: uuidv7(),
  project_id,
  table_name,
  level,
  field_type_id: '018ca19e-7a23-7bf4-8523-ff41e3b60807',
  widget_type_id: '018ca1a0-f187-7fdf-955b-4eaadaa92553',
})

export const createUnit = () => ({
  unit_id: uuidv7(),
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
})

export const createList = async ({ db, project_id, name = null }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    project_id,
    table: 'lists',
  })

  return {
    list_id: uuidv7(),
    project_id,
    name,
    obsolete: false,

    ...presetData,
  }
}

export const createTaxonomy = async ({ db, project_id }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    project_id,
    table: 'taxonomies',
  })

  return {
    taxonomy_id: uuidv7(),
    project_id,
    obsolete: false,

    ...presetData,
  }
}

export const createProjectUser = async ({ project_id, db }) =>
  db.query(
    `insert into project_users (project_user_id, project_id, role) values ($1, $2, $3) returning project_user_id`,
    [uuidv7(), project_id, 'reader'],
  )

export const createProjectReport = async ({ db, project_id }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    project_id,
    table: 'project_reports',
  })

  return {
    project_report_id: uuidv7(),
    project_id,
    year: new Date().getFullYear(),

    ...presetData,
  }
}

export const createPlaceLevel = () => ({
  place_level_id: uuidv7(),
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
})

export const createTaxon = async ({ taxonomy_id, db }) =>
  db.query(
    `insert into taxa (taxon_id, taxonomy_id) values ($1, $2) returning taxon_id`,
    [uuidv7(), taxonomy_id],
  )

export const createListValue = ({ list_id, db }) =>
  db.query(
    `insert into list_values (list_value_id, account_id, list_id, obsolete) values ($1, $2, $3, $4) 
    returnning list_value_id`,
    [uuidv7(), '018cf958-27e2-7000-90d3-59f024d467be', list_id, false],
  )

export const createGoal = async ({ db, project_id, subproject_id }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    project_id,
    table: 'goals',
  })

  return {
    goal_id: uuidv7(),
    subproject_id,
    year: new Date().getFullYear(),

    ...presetData,
  }
}

export const createGoalReport = async ({ db, project_id, goal_id }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    project_id,
    table: 'goal_reports',
  })

  return {
    goal_report_id: uuidv7(),
    goal_id,

    ...presetData,
  }
}

export const createGoalReportValue = () => ({
  goal_report_value_id: uuidv7(),
})

export const createSubprojectUser = () => ({
  subproject_user_id: uuidv7(),
  role: 'reader',
})

export const createPlaceUser = async ({ place_id, db }) =>
  db.query(
    `insert into place_users (place_user_id, place_id, role) values ($1, $2, $3) returning place_user_id`,
    [uuidv7(), place_id, 'reader'],
  )

export const createSubprojectTaxon = () => ({
  subproject_taxon_id: uuidv7(),
})

export const createSubprojectReport = async ({
  db,
  project_id,
  subproject_id,
}) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    project_id,
    table: 'subproject_reports',
  })

  const data = {
    subproject_report_id: uuidv7(),
    subproject_id,
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

export const createCheck = async ({ db, project_id, place_id }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    project_id,
    table: 'checks',
  })

  return {
    check_id: uuidv7(),
    place_id,
    date: new Date(),
    relevant_for_reports: true,

    ...presetData,
  }
}

export const createCheckValue = () => ({
  check_value_id: uuidv7(),
})

export const createCheckTaxon = () => ({
  check_taxon_id: uuidv7(),
})

export const createAction = async ({ db, project_id, place_id }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    project_id,
    table: 'actions',
  })

  return {
    action_id: uuidv7(),
    place_id,
    date: new Date(),
    relevant_for_reports: true,

    ...presetData,
  }
}

export const createActionValue = () => ({
  action_value_id: uuidv7(),
})

export const createActionReport = async ({ db, project_id, action_id }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    project_id,
    table: 'action_reports',
  })

  return {
    action_report_id: uuidv7(),
    action_id,
    year: new Date().getFullYear(),

    ...presetData,
  }
}

export const createActionReportValue = () => ({
  action_report_value_id: uuidv7(),
})

export const createPlaceReport = async ({ db, project_id, place_id }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    project_id,
    table: 'place_reports',
  })

  const data = {
    place_report_id: uuidv7(),
    place_id,
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

export const createPlaceReportValue = async ({ place_report_id, db }) =>
  db.query(
    `insert into place_report_values (place_report_value_id, place_report_id) values ($1, $2) returning place_report_value_id`,
    [uuidv7(), place_report_id],
  )

export const createMessage = () => ({
  message_id: uuidv7(),
  date: new Date(),
})

export const createWmsLayer = ({ project_id }) => ({
  wms_layer_id: uuidv7(),
  project_id,
})

export const createVectorLayer = ({
  project_id,
  type = null,
  own_table = null,
  own_table_level = null,
  label = null,
  max_features = 1000,
}) => ({
  vector_layer_id: uuidv7(),
  project_id,
  label,
  type,
  own_table,
  own_table_level,
  max_features,
})

export const createWfsService = ({
  project_id = null,
  url = null,
  version = null,
  info_formats = null,
  info_format = null,
  default_crs = null,
}) => ({
  wfs_service_id: uuidv7(),
  project_id,
  version,
  url,
  info_formats,
  info_format,
  default_crs,
})

export const createWfsServiceLayer = ({
  wfs_service_id,
  name = null,
  label = null,
}) => ({
  wfs_service_layer_id: uuidv7(),
  wfs_service_id,
  name,
  label,
})

export const createVectorLayerDisplay = ({
  vector_layer_id = null,
  display_property_value = null,
}) => ({
  vector_layer_display_id: uuidv7(),
  display_property_value,
  vector_layer_id,
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
})

export const createLayerPresentation = ({
  vector_layer_id = null,
  wms_layer_id = null,
  account_id = null,
  active = false,
  transparent = false,
}) => ({
  layer_presentation_id: uuidv7(),
  account_id,
  vector_layer_id,
  wms_layer_id,
  active,
  opacity_percent: 100,
  grayscale: false,
  transparent,
  max_zoom: 19,
  min_zoom: 0,
})

export const createWmsService = ({
  project_id = null,
  url = null,
  image_formats = null,
  image_format = null,
  version = null,
  info_formats = null,
  info_format = null,
  default_crs = null,
}) => ({
  wms_service_id: uuidv7(),
  project_id,
  version,
  url,
  image_formats,
  image_format,
  info_formats,
  info_format,
  default_crs,
})

export const createWmsServiceLayer = ({
  wms_service_id,
  name = null,
  label = null,
  queryable = null,
  legend_url = null,
  legend_image = null,
}) => ({
  wms_service_layer_id: uuidv7(),
  wms_service_id,
  name,
  label,
  queryable,
  legend_url,
  legend_image,
})

export const createChart = ({
  project_id = null,
  subproject_id = null,
  place_id = null,
}) => ({
  chart_id: uuidv7(),
  account_id: '018cf958-27e2-7000-90d3-59f024d467be', // TODO: replace with auth data when implemented
  project_id,
  subproject_id,
  place_id,
})

export const createChartSubject = ({ chart_id }) => ({
  chart_subject_id: uuidv7(),
  account_id: '018cf958-27e2-7000-90d3-59f024d467be', // TODO: replace with auth data when implemented
  chart_id,
  type: 'monotone',
  stroke: '#FF0000',
  fill: '#ffffff',
  fill_graded: true,
  connect_nulls: true,
})

export const createOccurrenceImport = ({ subproject_id }) => ({
  occurrence_import_id: uuidv7(),
  account_id: '018cf958-27e2-7000-90d3-59f024d467be', // TODO: replace with auth data when implemented
  subproject_id,
  geometry_method: 'coordinates',
  crs: 'EPSG:4326',
  created_time: Date.now(),
  download_from_gbif: false,
})

export const createOccurrence = ({ occurrence_import_id, data = null }) => ({
  occurrence_id: uuidv7(),
  account_id: '018cf958-27e2-7000-90d3-59f024d467be', // TODO: replace with auth data when implemented
  occurrence_import_id,
  data,
})

export const createNotification = ({
  title = null,
  body = null,
  // 'success' | 'error' | 'warning' | 'info'
  intent = 'info',
  timeout = 10000,
  paused = null,
}) => ({
  notification_id: uuidv7(),
  title,
  body,
  intent,
  timeout,
  paused,
})
