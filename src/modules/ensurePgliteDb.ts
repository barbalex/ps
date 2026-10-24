import { PGliteWorker } from '@electric-sql/pglite/worker'
import type { PGlite } from '@electric-sql/pglite'
import { electricSync } from '@electric-sql/pglite-sync'
import { live } from '@electric-sql/pglite/live'

import { pgliteDbAtom, store } from '../store.ts'

let creatingDbPromise: Promise<PGliteWorker> | null = null

// The database (WASM Postgres, Electric sync applies, live-query execution,
// IndexedDB persistence) runs inside a web worker so heavy sync batches and
// query work never block the UI thread. pglite-worker.ts registers the real
// extensions on the worker-side instance; the factories passed here attach
// the client-side namespaces, whose methods become RPC calls to the worker.
// Only live and electric have client-side namespaces — postgis/pg_uuidv7 are
// emscripten extensions and only provide SQL functions that run worker-side
// (their factories throw when set up on the worker client).
// NB: briefly reverted once — with @electric-sql/client 1.0.14 the stream
// pause/resume storm stalled the worker's query lock for ~2 minutes at a
// time; client 1.5.28 removed that machinery, which is believed to have
// been the actual trigger.
const createDb = () => {
  const worker = new Worker(new URL('../pglite-worker.ts', import.meta.url), {
    type: 'module',
  })
  return PGliteWorker.create(worker, {
    extensions: {
      live,
      electric: electricSync(),
    },
    relaxedDurability: true,
  }).catch((err: unknown) => {
    worker.terminate()
    throw err
  })
}

const isWasmAbort = (err: unknown) =>
  err instanceof Error &&
  (err.message.includes('Aborted') || err.name === 'RuntimeError')

/** Delete all IndexedDB databases that look like they belong to this app. */
export const deleteIdbDatabases = async () => {
  if (typeof indexedDB === 'undefined') return
  const fallback = ['ps', '/ps']
  const discovered =
    'databases' in indexedDB
      ? await indexedDB
          .databases()
          .then((dbs) => dbs.map((d) => d.name).filter(Boolean) as string[])
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
      .then(async (db) => {
        store.set(pgliteDbAtom, db as unknown as PGlite)

        if (import.meta.env.DEV) {
          window.__pglite_db__ = db as unknown as PGlite
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
