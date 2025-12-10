import { removeOperation } from './removeOperation.ts'

// reverts an optimistic operation (change in PGlite) after writing to the server fails
export const revertOperation = async (o) => {
  if (!o) return

  const username = 'TODO: extract username from auth'

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

  if (operation === 'insert') {
    try {
      await pgliteDb.query(
        `DELETE FROM ${table} 
         WHERE ${rowIdName} = $1
        `,
        [rowId],
      )
    } catch (error) {
      return console.error(
        `revertOperation: error deleting row ${rowId} from ${table}:`,
        error,
      )
    }
    return
  }

  try {
    await pgliteDb.query(
      `UPDATE ${table} 
      SET 
        ${column} = $1, 
        updated_at = $3,
        updated_by: $4 
      WHERE ${rowIdName} = $2`,
      [prevValue, projectId, time, username],
    )
  } catch (error) {
    return console.error(
      `revertOperation: error reverting row ${rowId} in ${table}:`,
      error,
    )
  }

  return removeOperation(operation)
}
