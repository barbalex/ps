import { addOperationAtom, pgliteDbAtom, store } from '../store.ts'
import type Files from '../models/public/Files.ts'

/**
 * Sets files.offline: optimistic local update plus a queued update. The
 * queued update flushes at once outside a form session (the ~5s row debounce
 * applies inside one) — fine for a mark whose download is triggered locally
 * regardless.
 */
export const setFileOffline = async (fileId: string, offline: boolean) => {
  const db = store.get(pgliteDbAtom)
  if (!db) return

  const res = await db.query<Files>(
    `SELECT * FROM files WHERE file_id = $1`,
    [fileId],
  )
  const prev = res.rows[0]
  if (!prev) return

  await db.query(`UPDATE files SET offline = $1 WHERE file_id = $2`, [
    offline,
    fileId,
  ])

  store.set(addOperationAtom, {
    table: 'files',
    rowIdName: 'file_id',
    rowId: fileId,
    operation: 'update',
    column: 'offline',
    newValue: offline,
    draft: { offline },
    prev,
  })
}
