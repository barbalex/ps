import { useEffect, useState, useCallback } from 'react'
import { useCorbado } from '@corbado/react'
import { useSetAtom } from 'jotai'
// import { ShapeStream, Shape } from '@electric-sql/client'
import { usePGlite } from '@electric-sql/pglite-react'

import { syncingAtom } from '../store.ts'

const startSyncing = async ({ db, setSyncing, setSync }) => {
  console.log('Syncer.startSyncing', { db, setSyncing, setSync })
  const sync = await db.electric.syncShapesToTables({
    shapes: {
      users: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: { table: 'users', columns: ['user_id', 'email'] },
        },
        table: 'users',
        primaryKey: ['user_id'],
      },
      accounts: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: { table: 'accounts' },
        },
        table: 'accounts',
        primaryKey: ['account_id'],
      },
      project_types: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: { table: 'project_types' },
        },
        table: 'project_types',
        primaryKey: ['type'],
      },
      projects: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: { table: 'projects' },
        },
        table: 'projects',
        primaryKey: ['project_id'],
      },
    },
    key: 'ps-sync',
    onInitialSync: () => setSyncing(false),
    onError: (error) => console.error('Sync error', error),
  })
  setSync(sync)
}

export const Syncer = () => {
  const db = usePGlite()
  const [sync, setSync] = useState(null)

  const setSyncing = useSetAtom(syncingAtom)
  setSyncing(true)

  const { user: authUser } = useCorbado()

  const unsubscribe = useCallback(() => sync?.unsubscribe?.(), [sync])

  console.log('Syncer', { db, authUser })

  useEffect(() => {
    if (!db) return
    if (!setSyncing) return
    if (!setSync) return
    if (!unsubscribe) return

    startSyncing({ db, setSyncing, setSync })

    return () => {
      unsubscribe()
    }
  }, [authUser?.email, db, setSyncing, setSync])
  // authUser?.email

  return null
}
