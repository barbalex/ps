import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import type { QueryableDb } from './geoQueries.ts'
import { addOperationAtom } from '../store.ts'

type DeleteRowArgs = {
  table: string
  rowIdName: string
  rowId: string
}

// addOperationAtom's write signature for delete operations
type AddDeleteOperation = (op: {
  table: string
  rowIdName: string
  rowId: string
  operation: 'delete'
  prev: Record<string, unknown>
}) => Promise<void>

// Deletes a row from the local PGlite and queues the delete operation for
// sync — the same flow the form headers use for their delete button, shared
// so list rows can offer swipe-to-delete. addOperationAtom checks write
// permission and reverts the local delete with an error notification when
// the role is insufficient.
export const deleteRowFromDb = async (
  db: QueryableDb,
  addOperation: AddDeleteOperation,
  { table, rowIdName, rowId }: DeleteRowArgs,
): Promise<void> => {
  try {
    const prevRes = await db.query(`SELECT * FROM ${table} WHERE ${rowIdName} = $1`, [
      rowId,
    ])
    const prev = (prevRes?.rows?.[0] ?? {}) as Record<string, unknown>
    await db.query(`DELETE FROM ${table} WHERE ${rowIdName} = $1`, [rowId])
    await addOperation({
      table,
      rowIdName,
      rowId,
      operation: 'delete',
      prev,
    })
  } catch (error) {
    console.error(error)
  }
}

// binds db and operation queue for components; returns null-safe deleter
export const useDeleteRow = () => {
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  return (args: DeleteRowArgs) => {
    if (!db) return Promise.resolve()
    return deleteRowFromDb(db, addOperation, args)
  }
}
