import { addOperationAtom, pgliteDbAtom, store } from '../store.ts'
import type Files from '../models/public/Files.ts'

/**
 * Toggles files.offline: optimistic local update plus a queued update. The
 * queued update flushes at once outside a form session (the ~5s row debounce
 * applies inside one) — fine for a mark whose download is triggered locally
 * regardless.
 */
export const toggleFileOffline = async (fileId: string) => {
  const db = store.get(pgliteDbAtom)
  if (!db) throw new Error('Local database is unavailable')

  // Two clicks may arrive before the form's live query has refreshed.
  const { prev, offline } = await db.transaction(async (tx) => {
    const { rows } = await tx.query<Files>(
      `SELECT * FROM files WHERE file_id = $1 FOR UPDATE`, [fileId],
    )
    const prev = rows[0]
    if (!prev) throw new Error(`File not found: ${fileId}`)
    const offline = !prev.offline
    await tx.query(`UPDATE files SET offline = $1 WHERE file_id = $2`, [offline, fileId])
    return { prev, offline }
  })

  await store.set(addOperationAtom, {
    table: 'files',
    rowIdName: 'file_id',
    rowId: fileId,
    operation: 'update',
    column: 'offline',
    newValue: offline,
    draft: { offline },
    // Files is an interface: only an object literal satisfies the record type
    prev: { ...prev },
  })
}
