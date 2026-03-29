type HistoryRow = Record<string, unknown> & {
  place_history_id?: string
  updated_at?: string
}

export const getHistoryRecordId = (history: HistoryRow): string | null => {
  if (history.place_history_id) return history.place_history_id
  if (history.updated_at) return String(history.updated_at)
  return null
}

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
