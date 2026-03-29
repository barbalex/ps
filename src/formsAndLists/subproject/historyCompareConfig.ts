export const excludedDisplayFields = new Set(['sys_period', 'created_at'])

export const excludedRestoreFields = new Set([
  'subproject_id',
  'account_id',
  'project_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
  'deleted',
])

export const preferredOrder = ['name', 'start_year', 'end_year']
