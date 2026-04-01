export const excludedDisplayFields = new Set([
  'sys_period',
  'created_at',
  'account_id',
  'project_id',
])

export const excludedRestoreFields = new Set([
  'wms_layer_id',
  'account_id',
  'project_id',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
])

export const preferredOrder = [
  'wms_service_id',
  'wms_service_layer_name',
  'label',
  'local_data_size',
  'local_data_bounds',
]
