export const excludedDisplayFields = new Set([
  'sys_period',
  'created_at',
  'file',
  'preview',
])

export const excludedRestoreFields = new Set([
  'file_id',
  'account_id',
  'project_id',
  'subproject_id',
  'place_id',
  'action_id',
  'check_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
  'file',
  'preview',
  'deleted',
])

export const preferredOrder = [
  'name',
  'size',
  'mimetype',
  'url',
  'uuid',
  'preview_uuid',
  'width',
  'height',
  'data',
]
