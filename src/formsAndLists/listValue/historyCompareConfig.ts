export const excludedDisplayFields = new Set(['sys_period', 'created_at'])

export const excludedRestoreFields = new Set([
  'list_value_id',
  'account_id',
  'list_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
])

export const preferredOrder = [
  'value_integer',
  'value_numeric',
  'value_text',
  'value_date',
  'value_datetime',
  'obsolete',
]
