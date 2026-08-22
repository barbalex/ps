// Irregular table→PK mappings that don't follow the simple "strip s" rule.
const IRREGULAR_PK: Record<string, string> = {
  taxa: 'taxon_id',
}

// Infer the primary-key column name from the table name following codebase
// convention: strip trailing 's' (or 'ies'→'y'), append '_id'.
// Returns undefined when the candidate is not present in the draft.
// Insert operations from createRows.ts don't carry rowIdName/rowId, so
// reverting them depends on this inference.
export const inferPkColumn = (
  table: string,
  draft: Record<string, unknown> = {},
): string | undefined => {
  if (IRREGULAR_PK[table]) return IRREGULAR_PK[table]
  let candidate: string
  if (table.endsWith('ies')) {
    candidate = `${table.slice(0, -3)}y_id`
  } else {
    candidate = `${table.replace(/s$/, '')}_id`
  }
  if (candidate in draft) return candidate
  return undefined
}
