export const excludedDisplayFields = new Set([
  'sys_period',
  'created_at',
  'design',
  'label',
  'project_id',
])

export const excludedRestoreFields = new Set([
  'project_report_design_id',
  'project_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
])

export const preferredOrder = ['name', 'active']
