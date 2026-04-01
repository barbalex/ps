export const excludedDisplayFields = new Set([
  'sys_period',
  'created_at',
  'account_id',
  'wfs_service_id',
])

export const excludedRestoreFields = new Set([
  'wfs_service_layer_id',
  'account_id',
  'wfs_service_id',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
])

export const preferredOrder = ['name', 'label']
