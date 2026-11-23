import { atom } from 'jotai'

import { store, addOperationAtom, removeOperationAtom, pgliteDbAtom } from '../store.ts'
import { shapeDefinitions } from './shapeDefinitions.mjs'

export type UndoDeleteContext = {
  table: string
  rowIdName: string
  rowId: string
  // full row as it was before the delete (SELECT *), the source for restoring
  prev: Record<string, unknown>
  // id of the queued delete operation, so it can be dropped when it has not
  // synced yet
  opId: string
  label: string
  // changes on every delete so the bar can re-arm its timer/animation
  time: number
}

// the most recent swipe-to-delete, shown as an undo bar (mobile only)
export const undoDeleteAtom = atom<UndoDeleteContext | null>(null)

// only the columns the sync shape knows are restorable: they exclude
// generated columns (label etc., rejected on insert) and anything the
// local row would carry but the sync does not
export const columnsForRestore = (
  table: string,
  prev: Record<string, unknown>,
): string[] => {
  const shapeColumns = shapeDefinitions[table]?.columns
  if (!shapeColumns?.length) return []
  return shapeColumns.filter((c) => c in prev)
}

// undoes a swipe-to-delete: drops the queued delete operation (when it has
// not synced yet — otherwise the compensating insert below restores the
// row server-side), re-inserts the previous row locally (idempotent) and
// queues the insert for sync
export const undoDeleteRow = async (ctx: UndoDeleteContext): Promise<void> => {
  const db = store.get(pgliteDbAtom)
  if (!db) return
  const { table, rowIdName, prev, opId } = ctx

  if (opId) store.set(removeOperationAtom, opId)

  const columns = columnsForRestore(table, prev)
  store.set(undoDeleteAtom, null)
  if (!columns.length) {
    return console.error(`undoDeleteRow: no restorable columns for ${table}`)
  }

  const draft = Object.fromEntries(columns.map((c) => [c, prev[c]]))
  try {
    await db.query(
      `INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')})
      ON CONFLICT (${rowIdName}) DO NOTHING`,
      columns.map((c) => prev[c]),
    )
  } catch (error) {
    return console.error(`undoDeleteRow: could not restore ${table} row:`, error)
  }
  store.set(addOperationAtom, { table, operation: 'insert', draft })
}
