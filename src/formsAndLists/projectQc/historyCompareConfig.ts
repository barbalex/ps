export const excludedDisplayFields = new Set([
  'sys_period',
  'created_at',
  'project_qc_id',
  'project_id',
])

export const excludedRestoreFields = new Set([
  'project_qc_id',
  'account_id',
  'project_id',
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
  'sql',
]
