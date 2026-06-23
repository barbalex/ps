export const excludedDisplayFields = new Set([
  'sys_period',
  'created_at',
  'exports_id',
])

export const excludedRestoreFields = new Set([
  'exports_id',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
])

export const preferredOrder = [
  'name_de',
  'name_en',
  'name_fr',
  'name_it',
  'level',
  'filter_by_year',
  'description',
  'sql',
]
