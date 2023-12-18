import { uuidv7 } from '@kripod/uuidv7'

export const project = {
  project_id: uuidv7(),
  type: 'species',
  subproject_name_singular: 'Art',
  subproject_name_plural: 'Arten',
  values_on_multiple_levels: 'first',
  multiple_action_values_on_same_level: 'all',
  multiple_check_values_on_same_level: 'last',
  files_active: true,
  deleted: false,
}
