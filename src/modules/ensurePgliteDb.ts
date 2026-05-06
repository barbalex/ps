import { PGlite } from '@electric-sql/pglite'
import { electricSync } from '@electric-sql/pglite-sync'
import { postgis } from '@electric-sql/pglite-postgis'
import { live } from '@electric-sql/pglite/live'

import { pgliteDbAtom, store } from '../store.ts'

let creatingDbPromise: Promise<PGlite> | null = null

const createDb = () =>
  PGlite.create('idb://ps', {
    extensions: {
      live,
      electric: electricSync(),
      postgis,
    },
    relaxedDurability: true,
  })

const isWasmAbort = (err: unknown) =>
  err instanceof Error &&
  (err.message.includes('Aborted') || err.name === 'RuntimeError')

/** Delete all IndexedDB databases that look like they belong to this app. */
const deleteIdbDatabases = async () => {
  if (typeof indexedDB === 'undefined') return
  const fallback = ['ps', '/ps']
  const discovered =
    'databases' in indexedDB
      ? await indexedDB
          .databases()
          .then((dbs) =>
            dbs.map((d) => d.name).filter(Boolean) as string[],
          )
          .catch(() => [])
      : []
  const toDelete = [...new Set([...fallback, ...discovered])].filter((n) =>
    /ps|pglite|electric/i.test(n),
  )
  await Promise.all(
    toDelete.map(
      (name) =>
        new Promise<void>((resolve) => {
          const req = indexedDB.deleteDatabase(name)
          req.onsuccess = req.onerror = req.onblocked = () => resolve()
        }),
    ),
  )
}

export const ensurePgliteDb = async () => {
  const existingDb = store.get(pgliteDbAtom) as PGlite | null

  if (existingDb) return existingDb

  if (!creatingDbPromise) {
    creatingDbPromise = createDb()
      .catch(async (err) => {
        if (isWasmAbort(err)) {
          console.warn(
            'PGlite WASM aborted on open — local database may be corrupted. ' +
              'Deleting IndexedDB and retrying…',
            err,
          )
          await deleteIdbDatabases()
          return createDb()
        }
        throw err
      })
      .then((db) => {
        store.set(pgliteDbAtom, db)

        if (import.meta.env.DEV) {
          window.__pglite_db__ = db
          window.__jotai_store__ = store
        }

        return db
      })
      .finally(() => {
        creatingDbPromise = null
      })
  }

  return creatingDbPromise
}
