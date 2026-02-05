import { useEffect, useRef } from 'react'
import { useCorbado } from '@corbado/react'
import { useAtomValue } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { sqlInitializingAtom } from '../store.ts'
import { startSyncing } from '../modules/startSyncing.ts'

export const Syncer = () => {
  const db = usePGlite()
  const syncRef = useRef(null)
  const sqlInitializing = useAtomValue(sqlInitializingAtom)

  const { user: authUser } = useCorbado()

  // TODO: ensure syncing resumes after user has changed

  useEffect(() => {
    if (!db) return
    if (sqlInitializing) return

    if (!syncRef.current) {
      startSyncing(db).then((sync) => {
        syncRef.current = sync
      })
    }

    return () => {
      if (syncRef.current) {
        console.log('AuthAndDb.Syncer unsubscribing sync')
        syncRef.current.unsubscribe?.()
        syncRef.current = null
      }
    }
  }, [authUser?.email, db, sqlInitializing])

  return null
}
