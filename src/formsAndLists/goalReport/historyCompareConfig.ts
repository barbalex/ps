export const excludedDisplayFields = new Set(['sys_period', 'created_at'])

export const excludedRestoreFields = new Set([
  'goal_report_id',
  'account_id',
  'goal_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
  'deleted',
])

export const preferredOrder = ['data']
