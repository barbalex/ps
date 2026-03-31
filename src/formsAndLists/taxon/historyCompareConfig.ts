export const excludedDisplayFields = new Set([
  'sys_period',
  'created_at',
  'data',
  'label',
])

export const excludedRestoreFields = new Set([
  'taxon_id',
  'account_id',
  'taxonomy_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
])

export const preferredOrder = ['name', 'id_in_source', 'url']
