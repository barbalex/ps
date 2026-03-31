export const excludedDisplayFields = new Set(['sys_period', 'created_at'])

export const excludedRestoreFields = new Set([
  'field_id',
  'project_id',
  'account_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
])

export const preferredOrder = [
  'table_name',
  'level',
  'name',
  'field_label',
  'field_type_id',
  'widget_type_id',
  'list_id',
  'preset',
  'obsolete',
]
