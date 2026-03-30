export const excludedDisplayFields = new Set(['sys_period', 'created_at'])

export const excludedRestoreFields = new Set([
  'place_check_report_quantity_id',
  'account_id',
  'place_check_report_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
  'deleted',
])

export const preferredOrder = [
  'unit_id',
  'quantity_integer',
  'quantity_numeric',
  'quantity_text',
]
