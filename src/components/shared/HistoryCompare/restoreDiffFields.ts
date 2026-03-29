interface DbLike {
  query(sql: string, params?: unknown[]): Promise<unknown>
}

type RestoreDiffFieldsArgs = {
  db: DbLike
  table: string
  rowIdField: string
  rowId: string
  diffFields: string[]
  selectedHistory: Record<string, unknown>
  excludedRestoreFields: Set<string>
}

/**
 * Applies diff field values from a history record back to the current row via SQL UPDATE.
 * Returns the entries that were restored so the caller can record the operation.
 */
export const restoreDiffFields = async ({
  db,
  table,
  rowIdField,
  rowId,
  diffFields,
  selectedHistory,
  excludedRestoreFields,
}: RestoreDiffFieldsArgs): Promise<[string, unknown][]> => {
  const restoreEntries = diffFields
    .filter((field) => !excludedRestoreFields.has(field))
    .map((field): [string, unknown] => [field, selectedHistory[field]])

  if (!restoreEntries.length) return restoreEntries

  const setClauses = restoreEntries
    .map(([field], i) => `${field} = $${i + 1}`)
    .join(', ')
  const values = restoreEntries.map(([, value]) => value)

  await db.query(
    `UPDATE ${table} SET ${setClauses} WHERE ${rowIdField} = $${values.length + 1}`,
    [...values, rowId],
  )

  return restoreEntries
}
