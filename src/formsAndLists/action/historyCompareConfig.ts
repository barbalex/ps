export const excludedDisplayFields = new Set(['sys_period', 'created_at'])

export const excludedRestoreFields = new Set([
  'action_id',
  'account_id',
  'place_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
  'bbox',
  'geometry',
  'deleted',
])

export const preferredOrder = ['date', 'relevant_for_reports', 'data']
