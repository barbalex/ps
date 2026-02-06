import { useEffect } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'
import { useAtomValue, useSetAtom } from 'jotai'

import { initialSyncingAtom, sqlInitializingAtom } from '../store.ts'

export const InitialSyncManager = () => {
  const db = usePGlite()
  const setInitialSyncing = useSetAtom(initialSyncingAtom)
  const sqlInitializing = useAtomValue(sqlInitializingAtom)

  useEffect(() => {
    // Don't run until SQL initialization is complete
    if (sqlInitializing) return

    const run = async () => {
      const projectExistsResult = await db.query(
        `SELECT EXISTS (SELECT 1 FROM projects LIMIT 1)`,
      )
      const projectExists = projectExistsResult?.rows?.[0]?.exists ?? false
      if (projectExists) {
        // if project exists, we can assume initial sync has happened
        setInitialSyncing(false)
      }
    }

    run()
  }, [db, setInitialSyncing, sqlInitializing])

  return null
}
