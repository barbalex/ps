import { useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { atom, useSetAtom } from 'jotai'

import type { QueryableDb } from './geoQueries.ts'
import {
  captureCascadeClosure,
  type CascadeLevel,
} from './cascadeDelete.ts'
import { undoDeleteAtom } from './undoDelete.ts'
import {
  addOperationAtom,
  operationsQueueAtom,
  store,
} from '../store.ts'

export type DeleteRowArgs = {
  table: string
  rowIdName: string
  rowId: string
}

export type RowDeleteResult = 'deleted' | 'canceled'

// addOperationAtom's write signature for delete operations
type AddDeleteOperation = (op: {
  table: string
  rowIdName: string
  rowId: string
  operation: 'delete'
  prev: Record<string, unknown>
}) => Promise<void>

// a delete whose cascade would take child rows with it asks the user
// first (components/DeleteCascadeDialog.tsx consumes this)
export type PendingRowDelete = {
  label: string
  childCount: number
  time: number
  resolve: (confirmed: boolean) => void
}
export const pendingRowDeleteAtom = atom<PendingRowDelete | null>(null)

const askRowDeleteConfirm = (info: {
  label: string
  childCount: number
}): Promise<boolean> =>
  new Promise((resolve) => {
    store.set(pendingRowDeleteAtom, { ...info, time: Date.now(), resolve })
  })

// Deletes a row from the local PGlite and queues the delete operation for
// sync — the same flow the form headers use for their delete button, shared
// so list rows (swipe) and form headers can offer it. addOperationAtom
// checks write permission and reverts the local delete with an error
// notification when the role is insufficient. On success the delete is
// published to the mobile undo bar (see modules/undoDelete.ts).
//
// closure: the pre-captured cascade of the row (levels parent-first). When
// not given it is captured here — callers that already asked the user
// about the cascade pass theirs so the rows are fetched only once.
export const deleteRowFromDb = async (
  db: QueryableDb,
  addOperation: AddDeleteOperation,
  { table, rowIdName, rowId }: DeleteRowArgs,
  options?: { closure?: CascadeLevel[]; label?: string },
): Promise<'deleted' | 'failed'> => {
  try {
    const closure =
      options?.closure ??
      (await captureCascadeClosure(db, { table, rowIdName, rowId }))
    const prev = closure[0]?.rows[0] ?? {}
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
    if (!deleteOpId) return 'failed'
    // undoDeleteRow restores via the sync shape's columns, falling back to
    // the table's non-generated columns for shapes without an explicit list
    if (!Object.keys(prev).length) return 'deleted'
    store.set(undoDeleteAtom, {
      table,
      rowIdName,
      rowId,
      opId: deleteOpId,
      closure,
      label:
        options?.label ??
        String(prev.label ?? prev.name ?? rowId),
      time: Date.now(),
    })
    return 'deleted'
  } catch (error) {
    console.error(error)
    return 'failed'
  }
}

// The full delete flow, shared by list rows (swipe) and form headers:
// capture the cascade, ask the user when child rows would go with it,
// then delete and publish the undo. Resolves 'canceled' when the user
// backs out (or the row is already gone) — list rows slide back open.
export const useRequestRowDelete = () => {
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const navigate = useNavigate()

  return async (
    args: DeleteRowArgs & {
      navigateTo?: string
      // run after a successful delete (e.g. side effects the row's delete
      // always performed) and before the navigation
      afterDelete?: () => void | Promise<void>
    },
  ): Promise<RowDeleteResult> => {
    if (!db) return 'canceled'
    const { navigateTo, afterDelete, ...deleteArgs } = args

    const closure = await captureCascadeClosure(db, deleteArgs)
    const prev = closure[0]?.rows[0]
    if (!prev) return 'canceled'
    const label = String(prev.label ?? prev.name ?? deleteArgs.rowId)
    const childCount = closure
      .slice(1)
      .reduce((sum, level) => sum + level.rows.length, 0)

    if (childCount > 0) {
      const confirmed = await askRowDeleteConfirm({ label, childCount })
      if (!confirmed) return 'canceled'
    }

    const result = await deleteRowFromDb(db, addOperation, deleteArgs, {
      closure,
      label,
    })
    if (result !== 'deleted') return 'canceled'
    await afterDelete?.()
    if (navigateTo) navigate({ to: navigateTo })
    return 'deleted'
  }
}
