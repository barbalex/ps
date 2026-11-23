import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import type { QueryableDb } from './geoQueries.ts'
import { shapeDefinitions } from './shapeDefinitions.mjs'
import { undoDeleteAtom } from './undoDelete.ts'
import { addOperationAtom, operationsQueueAtom, store } from '../store.ts'

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
// the role is insufficient. On success the delete is published to the
// mobile undo bar (see modules/undoDelete.ts).
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

    // addOperationAtom reverts the local delete on permission failure
    // (notification shown there) — the queued delete op only exists on
    // success; it is prepended to the queue, so the find is exact
    const deleteOpId = store
      .get(operationsQueueAtom)
      .find(
        (o) =>
          o.table === table && o.operation === 'delete' && o.rowId === rowId,
      )?.id
    if (!deleteOpId) return
    // the undo restore needs the sync shape's columns (generated columns
    // like label cannot be re-inserted)
    if (!shapeDefinitions[table]?.columns?.length) return
    if (!Object.keys(prev).length) return
    store.set(undoDeleteAtom, {
      table,
      rowIdName,
      rowId,
      prev,
      opId: deleteOpId,
      label: String(prev.label ?? prev.name ?? rowId),
      time: Date.now(),
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
