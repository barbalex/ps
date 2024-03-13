import { uuidv7 } from '@kripod/uuidv7'

import { isMobilePhone } from './isMobilePhone'

const getPresetData = async ({ db, project_id = null, table }) => {
  const fieldsWithPresets = await db.fields.findMany({
    where: {
      project_id,
      deleted: false,
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
    deleted: false,
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
    deleted: false,
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
    deleted: false,
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
    deleted: false,
    ...presetData,
  }
}

export const createWidgetForField = () => ({
  widget_for_field_id: uuidv7(),
  deleted: false,
})

export const createWidgetType = () => ({
  widget_type_id: uuidv7(),
  needs_list: false,
  sort: 0,
  deleted: false,
})

export const createFieldType = () => ({
  field_type_id: uuidv7(),
  sort: 0,
  deleted: false,
})

export const createAccount = () => ({
  account_id: uuidv7(),
  type: 'free',
})

export const createUser = () => ({
  user_id: uuidv7(),
  deleted: false,
})

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
    deleted: false,
    ...presetData,
  }
}

export const createObservationSource = async ({ db, project_id }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    project_id,
    table: 'observation_sources',
  })

  return {
    observation_source_id: uuidv7(),
    project_id,
    deleted: false,
    ...presetData,
  }
}

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
  deleted: false,
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
  deleted: false,
})

export const createList = async ({ db, project_id }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    project_id,
    table: 'lists',
  })

  return {
    list_id: uuidv7(),
    project_id,
    obsolete: false,
    deleted: false,
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
    deleted: false,
    ...presetData,
  }
}

export const createProjectUser = () => ({
  project_user_id: uuidv7(),
  role: 'reader',
  deleted: false,
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
    deleted: false,
    ...presetData,
  }
}

export const createPlaceLevel = () => ({
  place_level_id: uuidv7(),
  level: 1,
  reports: false,
  report_values: false,
  actions: false,
  action_values: false,
  action_reports: false,
  checks: false,
  check_values: false,
  check_taxa: false,
  observations: false,
  deleted: false,
})

export const createObservation = async ({
  db,
  project_id,
  observation_source_id,
}) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    project_id,
    table: 'observations',
  })

  return {
    observation_id: uuidv7(),
    observation_source_id,
    deleted: false,
    ...presetData,
  }
}

export const createTaxon = () => ({
  taxon_id: uuidv7(),
  deleted: false,
})

export const createListValue = () => ({
  list_value_id: uuidv7(),
  obsolete: false,
  deleted: false,
})

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
    deleted: false,
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
    deleted: false,
    ...presetData,
  }
}

export const createGoalReportValue = () => ({
  goal_report_value_id: uuidv7(),
  deleted: false,
})

export const createSubprojectUser = () => ({
  subproject_user_id: uuidv7(),
  role: 'reader',
  deleted: false,
})

export const createPlaceUser = () => ({
  place_user_id: uuidv7(),
  role: 'reader',
  deleted: false,
})

export const createSubprojectTaxon = () => ({
  subproject_taxon_id: uuidv7(),
  deleted: false,
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
    deleted: false,
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
    deleted: false,
    ...presetData,
  }
}

export const createCheckValue = () => ({
  check_value_id: uuidv7(),
  deleted: false,
})

export const createCheckTaxon = () => ({
  check_taxon_id: uuidv7(),
  deleted: false,
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
    deleted: false,
    ...presetData,
  }
}

export const createActionValue = () => ({
  action_value_id: uuidv7(),
  deleted: false,
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
    deleted: false,
    ...presetData,
  }
}

export const createActionReportValue = () => ({
  action_report_value_id: uuidv7(),
  deleted: false,
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
    deleted: false,
    ...presetData,
  }
}

export const createPlaceReportValue = () => ({
  place_report_value_id: uuidv7(),
  deleted: false,
})

export const createMessage = () => ({
  message_id: uuidv7(),
  date: new Date(),
})

// TODO: sync (most of) these with search params
export const createUiOption = ({ user_id }) => ({
  user_id,
  designing: false,
  breadcrumbs_overflowing: true,
  navs_overflowing: true,
  tabs: isMobilePhone() ? ['data'] : ['tree', 'data'],
})

export const createTileLayer = ({ project_id }) => ({
  tile_layer_id: uuidv7(),
  project_id,
  sort: 0,
  active: false,
  type: 'wms',
  max_zoom: 19,
  min_zoom: 0,
  opacity_percent: 100,
  wms_transparent: false,
  grayscale: false,
  deleted: false,
})

export const createVectorLayer = ({
  project_id,
  type = 'wfs',
  label = null,
  sort = 0,
  active = false,
  max_zoom = 19,
  min_zoom = 0,
  max_features = 1000,
}) => ({
  vector_layer_id: uuidv7(),
  project_id,
  label,
  type,
  sort,
  active,
  max_zoom,
  min_zoom,
  max_features,
  deleted: false,
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
  deleted: false,
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
  deleted: false,
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
  deleted: false,
})

export const createOccurrenceImport = async ({ subproject_id }) => ({
  occurrence_import_id: uuidv7(),
  account_id: '018cf958-27e2-7000-90d3-59f024d467be', // TODO: replace with auth data when implemented
  subproject_id,
  created_time: Date.now(),
  download_from_gbif: false,
  deleted: false,
})
