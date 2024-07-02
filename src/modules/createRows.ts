import { uuidv7 } from '@kripod/uuidv7'

const getPresetData = async ({ db, project_id = null, table }) => {
  const fieldsWithPresets = await db.fields.findMany({
    where: {
      project_id,

      table_name: table,
      preset: { not: null },
    },
  })
  // TODO: include field_type to set correct data type
  const data = {}
  fieldsWithPresets.forEach((field) => {
    data[field.name] = field.preset
  })

  return { data }
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
export const createUser = async ({ db }) => {
  const data = { user_id: uuidv7() }
  await db.users.create({ data })
  await db.app_states.create({ data: { user_id: data.user_id } })

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

export const createCrs = ({ data = {} }) => ({
  crs_id: uuidv7(),
  ...data,
})

export const createProjectCrs = ({ project_id, data = {} }) => ({
  project_crs_id: uuidv7(),
  project_id,
  ...data,
})

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

export const createProjectUser = () => ({
  project_user_id: uuidv7(),
  role: 'reader',
})

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

export const createTaxon = () => ({
  taxon_id: uuidv7(),
})

export const createListValue = (val) => {
  const value = val?.value ?? null
  const list_id = val?.list_id ?? null
  return {
    list_value_id: uuidv7(),
    account_id: '018cf958-27e2-7000-90d3-59f024d467be', // TODO: replace with auth data when implemented
    list_id,
    value,
    obsolete: false,
  }
}

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

export const createPlaceUser = () => ({
  place_user_id: uuidv7(),
  role: 'reader',
})

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

  return {
    subproject_report_id: uuidv7(),
    subproject_id,
    year: new Date().getFullYear(),

    ...presetData,
  }
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

  return {
    place_report_id: uuidv7(),
    place_id,
    year: new Date().getFullYear(),

    ...presetData,
  }
}

export const createPlaceReportValue = () => ({
  place_report_value_id: uuidv7(),
})

export const createMessage = () => ({
  message_id: uuidv7(),
  date: new Date(),
})

// TODO: sync (most of) these with search params
// this is not used. Instead: users_app_state_trigger creates app_state on user creation
export const createAppState = ({ user_id }) => ({
  app_state_id: uuidv7(),
  user_id,
  designing: false,
  breadcrumbs_overflowing: true,
  navs_overflowing: true,
  tabs: ['tree', 'data'],
})

export const createTileLayer = ({ project_id }) => ({
  tile_layer_id: uuidv7(),
  project_id,
  sort: 0,
  type: 'wms',
  max_zoom: 19,
  min_zoom: 0,
  opacity_percent: 100,
  wms_transparent: false,
  grayscale: false,
})

export const createVectorLayer = ({
  project_id,
  type = 'wfs',
  label = null,
  sort = 0,
  max_zoom = 19,
  min_zoom = 0,
  max_features = 1000,
}) => ({
  vector_layer_id: uuidv7(),
  project_id,
  label,
  type,
  sort,
  max_zoom,
  min_zoom,
  max_features,
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
  opacity_percent: 100,
  line_cap: 'round',
  line_join: 'round',
  fill: true,
  fill_color: '#ff0000',
  fill_opacity_percent: 20,
  fill_rule: 'evenodd',
})

export const createLayerPresentation = ({
  vector_layer_id = null,
  tile_layer_id = null,
  account_id = null,
  active = false,
}) => ({
  layer_presentation_id: uuidv7(),
  account_id,
  vector_layer_id,
  tile_layer_id,
  active,
  opacity_percent: 100,
  grayscale: false,
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
