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
      place_levels: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'place_levels',
            columns: [
              'place_level_id',
              'account_id',
              'project_id',
              'level',
              'name_singular',
              'name_plural',
              'name_short',
              'reports',
              'report_values',
              'actions',
              'action_values',
              'action_reports',
              'checks',
              'check_values',
              'check_taxa',
              'occurrences',
            ],
          },
        },
        table: 'place_levels',
        primaryKey: ['place_level_id'],
      },
      subprojects: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'subprojects',
            columns: [
              'subproject_id',
              'account_id',
              'project_id',
              'name',
              'start_year',
              'end_year',
              'data',
            ],
          },
        },
        table: 'subprojects',
        primaryKey: ['subproject_id'],
      },
      project_users: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: { table: 'project_users' },
        },
        table: 'project_users',
        primaryKey: ['project_user_id'],
      },
      subproject_users: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: { table: 'subproject_users' },
        },
        table: 'subproject_users',
        primaryKey: ['subproject_user_id'],
      },
      taxonomies: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'taxonomies',
            columns: [
              'taxonomy_id',
              'account_id',
              'project_id',
              'type',
              'name',
              'url',
              'obsolete',
              'data',
            ],
          },
        },
        table: 'taxonomies',
        primaryKey: ['taxonomy_id'],
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
