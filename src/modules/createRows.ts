import { goalReport } from './createRows'
import { uuidv7 } from '@kripod/uuidv7'

const getPresetData = async ({ db, project_id, table }) => {
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
// TODO: refactor names to express creation
export const createProject = () => ({
  project_id: uuidv7(),
  type: 'species',
  subproject_name_singular: 'Art',
  subproject_name_plural: 'Arten',
  values_on_multiple_levels: 'first',
  multiple_action_values_on_same_level: 'all',
  multiple_check_values_on_same_level: 'last',
  files_active_projects: true,
  files_active_projects_reports: true,
  files_active_subprojects: true,
  files_active_subproject_reports: true,
  files_active_places: true,
  files_active_actions: true,
  files_active_checks: true,
  files_active_check_reports: true,
  deleted: false,
})

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

export const createFile = () => ({
  file_id: uuidv7(),
  deleted: false,
})

export const createPlace = async ({ db, project_id, subproject_id }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({
    db,
    project_id,
    table: 'places',
  })

  return {
    place_id: uuidv7(),
    subproject_id,
    level: 1,
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

export const account = () => ({
  account_id: uuidv7(),
  type: 'free',
})

export const user = () => ({
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

export const observationSource = async ({ db, project_id }) => {
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

export const field = () => ({
  field_id: uuidv7(),
  deleted: false,
})

export const unit = () => ({
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

export const list = async ({ db, project_id }) => {
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

export const taxonomy = async ({ db, project_id }) => {
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

export const projectUser = () => ({
  project_user_id: uuidv7(),
  role: 'reader',
  deleted: false,
})

export const projectReport = async ({ db, project_id }) => {
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

export const placeLevel = () => ({
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
  observation_references: false,
  deleted: false,
})

export const observation = async ({
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

export const taxon = () => ({
  taxon_id: uuidv7(),
  deleted: false,
})

export const listValue = () => ({
  list_value_id: uuidv7(),
  obsolete: false,
  deleted: false,
})

export const goal = async ({ db, project_id, subproject_id }) => {
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

export const goalReport = async ({ db, project_id, goal_id }) => {
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

export const goalReportValue = () => ({
  goal_report_value_id: uuidv7(),
  deleted: false,
})

export const subprojectUser = () => ({
  subproject_user_id: uuidv7(),
  role: 'reader',
  deleted: false,
})

export const placeUser = () => ({
  place_user_id: uuidv7(),
  role: 'reader',
  deleted: false,
})

export const subprojectTaxon = () => ({
  subproject_taxon_id: uuidv7(),
  deleted: false,
})

export const subprojectReport = async ({ db, project_id, subproject_id }) => {
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

export const check = async ({ db, project_id, place_id }) => {
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

export const checkValue = () => ({
  check_value_id: uuidv7(),
  deleted: false,
})

export const checkTaxon = () => ({
  check_taxon_id: uuidv7(),
  deleted: false,
})

export const action = async ({ db, project_id, place_id }) => {
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

export const actionValue = () => ({
  action_value_id: uuidv7(),
  deleted: false,
})

export const actionReport = async ({ db, project_id, action_id }) => {
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

export const actionReportValue = () => ({
  action_report_value_id: uuidv7(),
  deleted: false,
})

export const placeReport = async ({ db, project_id, place_id }) => {
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

export const placeReportValue = () => ({
  place_report_value_id: uuidv7(),
  deleted: false,
})

export const message = () => ({
  message_id: uuidv7(),
  date: new Date(),
})
