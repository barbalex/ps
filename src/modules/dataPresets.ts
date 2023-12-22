import { uuidv7 } from '@kripod/uuidv7'

// TODO: add account_id
export const project = () => ({
  project_id: uuidv7(),
  type: 'species',
  subproject_name_singular: 'Art',
  subproject_name_plural: 'Arten',
  values_on_multiple_levels: 'first',
  multiple_action_values_on_same_level: 'all',
  multiple_check_values_on_same_level: 'last',
  files_active: true,
  deleted: false,
})

export const subproject = () => ({
  subproject_id: uuidv7(),
  files_active: true,
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
