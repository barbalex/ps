export const excludedDisplayFields = new Set([
  'sys_period',
  'created_at',
  'label',
  'project_id',
])

export const excludedRestoreFields = new Set([
  'wfs_service_id',
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
  'info_formats',
  'info_format',
  'default_crs',
]
