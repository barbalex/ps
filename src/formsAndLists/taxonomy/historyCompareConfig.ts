export const excludedDisplayFields = new Set([
  'sys_period',
  'created_at',
  'data',
  'label',
])

export const excludedRestoreFields = new Set([
  'taxonomy_id',
  'account_id',
  'project_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
])

export const preferredOrder = ['name', 'type', 'unit_id', 'url', 'obsolete']
