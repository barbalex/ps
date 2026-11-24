import { atom } from 'jotai'

import {
  store,
  addOperationAtom,
  removeOperationAtom,
  pgliteDbAtom,
} from '../store.ts'
import { shapeDefinitions } from './shapeDefinitions.mjs'
import { inferPkColumn } from './inferPkColumn.ts'
import type { QueryableDb } from './geoQueries.ts'
import type { CascadeLevel } from './cascadeDelete.ts'

export type UndoDeleteContext = {
  table: string
  rowIdName: string
  rowId: string
  // id of the queued delete operation, so it can be dropped when it has not
  // synced yet
  opId: string
  // the cascade captured before the delete: level 0 is the row itself, the
  // following levels the cascade-deleted child rows (role tables first —
  // see ROLE_TABLES in cascadeDelete.ts)
  closure: CascadeLevel[]
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
  row: Record<string, unknown>,
): string[] => {
  const shapeColumns = shapeDefinitions[table]?.columns
  if (!shapeColumns?.length) return []
  return shapeColumns.filter((c) => c in row)
}

// shapes without an explicit column list sync every column — fall back to
// the table's actual non-generated columns (the same guard the server
// applier applies to insert drafts)
const restorableColumnsCache = new WeakMap<object, Promise<Map<string, string[]>>>()
const restorableColumns = async (db: QueryableDb, table: string): Promise<string[]> => {
  const shapeColumns = shapeDefinitions[table]?.columns
  if (shapeColumns?.length) return shapeColumns
  let cache = restorableColumnsCache.get(db as object)
  if (!cache) {
    cache = (async () => {
      const res = await db.query(
        `SELECT table_name, column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND is_generated = 'NEVER'`,
      )
      const map = new Map<string, string[]>()
      for (const r of res.rows as { table_name: string; column_name: string }[]) {
        const cols = map.get(r.table_name) ?? []
        cols.push(r.column_name)
        map.set(r.table_name, cols)
      }
      return map
    })()
    restorableColumnsCache.set(db as object, cache)
  }
  return (await cache).get(table) ?? []
}

// undoes a swipe-to-delete: drops the queued delete operation (when it has
// not synced yet — otherwise the compensating inserts below restore the
// rows server-side), re-inserts the captured cascade locally level by
// level (idempotent) and queues the inserts for sync.
//
// the compensating inserts skip the client-side permission check: the
// delete operation that removed these rows was already permission-checked,
// and after a synced cascade the role rows they would be checked against
// are themselves deleted (they are restored first for exactly that
// reason). the server applies its own enforcement and reports duplicates
// instead of failing, so restoring over rows the delete never touched is
// harmless.
export const undoDeleteRow = async (ctx: UndoDeleteContext): Promise<void> => {
  const db = store.get(pgliteDbAtom)
  if (!db) return
  const { opId, closure } = ctx

  if (opId) store.set(removeOperationAtom, opId)
  store.set(undoDeleteAtom, null)

  for (const level of closure) {
    const shape = shapeDefinitions[level.table]
    const pk = shape?.primaryKey?.[0] ?? inferPkColumn(level.table, level.rows[0])
    if (!pk) continue
    const tableColumns = await restorableColumns(db, level.table)
    if (!tableColumns.length) continue

    const rows: Record<string, unknown>[] = []
    for (const row of level.rows) {
      const columns = tableColumns.filter((c) => c in row)
      if (!columns.length) continue
      try {
        await db.query(
          `INSERT INTO ${level.table} (${columns.join(', ')})
          VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')})
          ON CONFLICT (${pk}) DO NOTHING`,
          columns.map((c) => row[c]),
        )
        rows.push(row)
      } catch (error) {
        console.error(
          `undoDeleteRow: could not restore ${level.table} row:`,
          error,
        )
      }
    }
    if (!rows.length) continue

    const draft = rows.map((row) =>
      Object.fromEntries(
        tableColumns.filter((c) => c in row).map((c) => [c, row[c]]),
      ),
    )
    store.set(addOperationAtom, {
      table: level.table,
      operation: rows.length > 1 ? 'insertMany' : 'insert',
      ...(level.table === ctx.table && rows.length === 1
        ? { rowIdName: ctx.rowIdName, rowId: ctx.rowId }
        : {}),
      draft: rows.length > 1 ? draft : draft[0],
      skipPermissionCheck: true,
    })
  }
}
