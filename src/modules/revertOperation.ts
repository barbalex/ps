import { removeOperation } from './removeOperation.ts'
import { store, pgliteDbAtom, postgrestClientAtom } from '../store.ts'

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
    draft,
    prev,
    column,
    prevUpdatedAt,
    prevUpdatedBy,
  } = o

  const postgrestClient = store.get(postgrestClientAtom)
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
      valueSql += `${key} = $${index + 1},`
    })
    const args = [
      ...Object.keys(draft).map((key) => prev[key]),
      prev.updated_at,
      prev.updated_by,
      rowId,
    ]
    const draftKeysLength = Object.keys(draft).length
    await pgliteDb.query(
      `
      UPDATE ${table} 
      SET 
        ${valuesSql} 
        updated_at = $${draftKeysLength + 1},
        updated_by: $${draftKeysLength + 2} 
      WHERE ${rowIdName} = $${draftKeysLength + 3}`,
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
