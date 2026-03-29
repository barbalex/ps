export const excludedDisplayFields = new Set(['sys_period', 'created_at'])

export const excludedRestoreFields = new Set([
  'place_id',
  'account_id',
  'subproject_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
  'bbox',
  'deleted',
])

export const preferredOrder = [
  'level',
  'since',
  'until',
  'relevant_for_reports',
]
