// reverts an optimistic operation (change in PGlite) after writing to the server fails
export const revertOperation = async (o) => {
  if (!o) return

  const username = 'TODO: extract from auth'

  const {
    id,
    time,
    table,
    rowIdName,
    rowId,
    operation,
    column,
    newValue,
    prevValue,
    prevUpdatedAt,
    prevUpdatedBy,
    postgrestClient,
    pgliteDb,
  } = o

  // syncing re-introduces the deleted row
  if (operation === 'delete') return

  if (operation === insert) {
    // TODO: delete
  }

  try {
    await pgliteDb.query(
      `UPDATE ${table} SET ${column} = $1 WHERE ${rowIdName} = $2`,
      [prevValue, projectId],
    )
  } catch (error) {
    return console.error(`error reverting row ${rowId} in ${table}:`, error)
  }
}
