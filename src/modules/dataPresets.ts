import { goalReport } from './dataPresets'
import { uuidv7 } from '@kripod/uuidv7'

// TODO: add account_id
// TODO: refactor names to express creation
export const project = () => ({
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

export const subproject = () => ({
  subproject_id: uuidv7(),
  deleted: false,
})

export const file = () => ({
  file_id: uuidv7(),
  deleted: false,
})

export const place = () => ({
  place_id: uuidv7(),
  level: 1,
  deleted: false,
})

export const widgetForField = () => ({
  widget_for_field_id: uuidv7(),
  deleted: false,
})

export const widgetType = () => ({
  widget_type_id: uuidv7(),
  needs_list: false,
  sort: 0,
  deleted: false,
})

export const fieldType = () => ({
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

export const person = () => ({
  person_id: uuidv7(),
  deleted: false,
})

export const observationSource = () => ({
  observation_source_id: uuidv7(),
  deleted: false,
})

export const field = () => ({
  field_id: uuidv7(),
  deleted: false,
})

export const unit = () => ({
  unit_id: uuidv7(),
  use_for_action_values: false,
  use_for_action_report_values: false,
  use_for_check_values: false,
  use_for_place_report_values: false,
  use_for_goal_report_values: false,
  use_for_subproject_taxa: false,
  use_for_check_taxa: false,
  summable: false,
  sort: 0,
  type: 'integer',
  deleted: false,
})

export const list = () => ({
  list_id: uuidv7(),
  obsolete: false,
  deleted: false,
})

export const taxonomy = () => ({
  taxonomy_id: uuidv7(),
  obsolete: false,
  deleted: false,
})

export const projectUser = () => ({
  project_user_id: uuidv7(),
  role: 'reader',
  deleted: false,
})

export const projectReport = () => ({
  project_report_id: uuidv7(),
  year: new Date().getFullYear(),
  deleted: false,
})

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

export const observation = () => ({
  observation_id: uuidv7(),
  deleted: false,
})

export const taxon = () => ({
  taxon_id: uuidv7(),
  deleted: false,
})

export const listValue = () => ({
  list_value_id: uuidv7(),
  obsolete: false,
  deleted: false,
})

export const goal = () => ({
  goal_id: uuidv7(),
  year: new Date().getFullYear(),
  deleted: false,
})

export const goalReport = () => ({
  goal_report_id: uuidv7(),
  deleted: false,
})

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

export const subprojectReport = () => ({
  subproject_report_id: uuidv7(),
  year: new Date().getFullYear(),
  deleted: false,
})

export const check = () => ({
  check_id: uuidv7(),
  date: new Date(),
  relevant_for_reports: true,
  deleted: false,
})

export const checkValue = () => ({
  check_value_id: uuidv7(),
  deleted: false,
})

export const checkTaxon = () => ({
  check_taxon_id: uuidv7(),
  deleted: false,
})

export const action = () => ({
  action_id: uuidv7(),
  date: new Date(),
  relevant_for_reports: true,
  deleted: false,
})

export const actionValue = () => ({
  action_value_id: uuidv7(),
  deleted: false,
})

export const actionReport = () => ({
  action_report_id: uuidv7(),
  year: new Date().getFullYear(),
  deleted: false,
})

export const actionReportValue = () => ({
  action_report_value_id: uuidv7(),
  deleted: false,
})

export const placeReport = () => ({
  place_report_id: uuidv7(),
  year: new Date().getFullYear(),
  deleted: false,
})

export const placeReportValue = () => ({
  place_report_value_id: uuidv7(),
  deleted: false,
})

export const message = () => ({
  message_id: uuidv7(),
  date: new Date(),
})
