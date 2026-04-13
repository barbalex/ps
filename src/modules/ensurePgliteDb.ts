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

export const ensurePgliteDb = async () => {
  const existingDb = store.get(pgliteDbAtom) as PGlite | null

  if (existingDb) return existingDb

  if (!creatingDbPromise) {
    creatingDbPromise = createDb()
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
