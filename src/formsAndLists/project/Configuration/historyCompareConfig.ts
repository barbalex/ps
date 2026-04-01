export const excludedDisplayFields = new Set([
  'sys_period',
  'created_at',
  // shown in project form, not configuration
  'name',
  'label',
  'data',
  'account_id',
  'project_id',
])

export const excludedRestoreFields = new Set([
  'project_id',
  'account_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
  'deleted',
])

export const preferredOrder = [
  'type',
  'subproject_name_singular',
  'subproject_name_plural',
  'subproject_name_singular_en',
  'subproject_name_plural_en',
  'subproject_name_singular_fr',
  'subproject_name_plural_fr',
  'subproject_name_singular_it',
  'subproject_name_plural_it',
  'checks_default_unit_id',
  'check_taxa_default_unit_id',
  'check_reports_default_unit_id',
  'actions_default_unit_id',
  'action_taxa_default_unit_id',
  'action_reports_default_unit_id',
  'values_on_multiple_levels',
  'multiple_check_quantities_on_same_level',
  'multiple_action_quantities_on_same_level',
]
