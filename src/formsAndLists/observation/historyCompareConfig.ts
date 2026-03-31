export const excludedDisplayFields = new Set([
  'sys_period',
  'created_at',
  'data',
  'geometry',
  'id_in_source',
  'label',
])

export const excludedRestoreFields = new Set([
  'observation_id',
  'account_id',
  'observation_import_id',
  'id_in_source',
  'geometry',
  'data',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
])

export const preferredOrder = ['place_id', 'not_to_assign', 'comment']
