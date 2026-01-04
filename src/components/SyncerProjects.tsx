import { useEffect, useState } from 'react'
import { useCorbado } from '@corbado/react'
import { useAtomValue } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { sqlInitializingAtom } from '../store.ts'
import { startSyncingProjects } from '../modules/startSyncingProjects.ts'

export const SyncerProjects = () => {
  const db = usePGlite()
  const [sync, setSync] = useState(null)
  const sqlInitializing = useAtomValue(sqlInitializingAtom)

  const { user: authUser } = useCorbado()

  // TODO: ensure syncing resumes after user has changed

  useEffect(() => {
    if (!db) return
    if (sqlInitializing) return

    if (!sync) startSyncingProjects(db).then((sync) => setSync(sync))

    return () => {
      !!sync && console.log('SyncerProjects unsubscribing sync')
      sync?.unsubscribe?.()
    }
  }, [authUser?.email, db, sync, sqlInitializing])

  return null
}
