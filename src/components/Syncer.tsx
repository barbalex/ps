import { useEffect, useState } from 'react'
import { useCorbado } from '@corbado/react'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { sqlInitializingAtom } from '../store.ts'
import { startSyncing } from '../modules/startSyncing.ts'

export const Syncer = () => {
  const db = usePGlite()
  const [sync, setSync] = useState(null)
  const [sqlInitializing] = useAtom(sqlInitializingAtom)

  const { user: authUser } = useCorbado()

  // TODO: ensure syncing resumes after user has changed

  useEffect(() => {
    if (!db) return
    if (sqlInitializing) return

    if (!sync) startSyncing(db).then((sync) => setSync(sync))

    return () => {
      !!sync && console.log('AuthAndDb.Syncer unsubscribing sync')
      sync?.unsubscribe?.()
    }
  }, [authUser?.email, db, sync, sqlInitializing])

  return null
}
