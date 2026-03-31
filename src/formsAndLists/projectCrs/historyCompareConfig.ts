export const excludedDisplayFields = new Set([
  'sys_period',
  'created_at',
  'label',
  'crs_id',
])

export const excludedRestoreFields = new Set([
  'project_crs_id',
  'account_id',
  'project_id',
  'crs_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
])

export const preferredOrder = ['code', 'name', 'proj4']
