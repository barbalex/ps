export const excludedDisplayFields = new Set(['sys_period', 'created_at'])

export const excludedRestoreFields = new Set([
  'subproject_role_id',
  'subproject_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
])

export const preferredOrder = ['project_user_id', 'role']
