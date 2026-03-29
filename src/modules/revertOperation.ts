import { removeOperation } from './removeOperation.ts'
import { store, pgliteDbAtom } from '../store.ts'

// reverts an optimistic operation (change in PGlite) after writing to the server fails
export const revertOperation = async (o) => {
  if (!o) return

  const { table, rowIdName, rowId, operation, draft, prev } = o

  const pgliteDb = store.get(pgliteDbAtom)

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
      // TODO: surface
      return console.error(
        `revertOperation: error deleting row ${rowId} from ${table}:`,
        error,
      )
    }
    return
  }

  try {
    let valuesSql = ``
    Object.keys(draft).forEach((key, index) => {
      valuesSql += `${key} = $${index + 1},`
    })
    const draftKeysLength = Object.keys(draft).length
    const isUsersTable = table === 'users'
    const args = [
      ...Object.keys(draft).map((key) => prev[key]),
      prev.updated_at,
      ...(isUsersTable ? [] : [prev.updated_by]),
      rowId,
    ]
    await pgliteDb.query(
      `
      UPDATE ${table} 
      SET 
        ${valuesSql} 
        updated_at = $${draftKeysLength + 1}
        ${isUsersTable ? '' : `, updated_by = $${draftKeysLength + 2}`}
      WHERE ${rowIdName} = $${isUsersTable ? draftKeysLength + 2 : draftKeysLength + 3}`,
      args,
    )
  } catch (error) {
    // TODO: surface
    return console.error(
      `revertOperation: error reverting row ${rowId} in ${table}:`,
      error,
    )
  }

  return removeOperation(operation)
}
