export const excludedDisplayFields = new Set([
  'sys_period',
  'created_at',
  'label',
  'account_id',
  'project_id',
])

export const excludedRestoreFields = new Set([
  'wms_service_id',
  'account_id',
  'project_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
])

export const preferredOrder = [
  'url',
  'version',
  'image_formats',
  'image_format',
  'info_formats',
  'info_format',
  'default_crs',
]
