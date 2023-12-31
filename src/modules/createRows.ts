import { uuidv7 } from '@kripod/uuidv7'

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

export const createFile = async ({ db }) => {
  // find fields with preset values on the data column
  const presetData = await getPresetData({ db, table: 'files' })

  return {
    file_id: uuidv7(),
    deleted: false,
    ...presetData,
  }
}

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

export const createField = ({ project_id }) => ({
  field_id: uuidv7(),
  project_id: project_id ? project_id : null,
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
  observation_references: false,
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
