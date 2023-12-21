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
  widget_type: uuidv7(),
  needs_list: false,
  sort: 0,
  deleted: false,
})
