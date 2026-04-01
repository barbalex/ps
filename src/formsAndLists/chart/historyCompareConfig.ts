export const excludedDisplayFields = new Set([
  'sys_period',
  'created_at',
  'account_id',
  'project_id',
  'subproject_id',
  'place_id',
  'label',
])

export const excludedRestoreFields = new Set([
  'chart_id',
  'account_id',
  'project_id',
  'subproject_id',
  'place_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
])

export const preferredOrder = [
  'chart_type',
  'name',
  'years_current',
  'years_previous',
  'years_specific',
  'years_last_x',
  'years_since',
  'years_until',
  'subjects_stacked',
  'subjects_single',
  'percent',
]
