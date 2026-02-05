import { useEffect, useRef } from 'react'
import { useCorbado } from '@corbado/react'
import { useAtomValue } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { sqlInitializingAtom } from '../store.ts'
import { startSyncingSingly } from '../modules/startSyncingSingly.ts'

export const SyncerSingly = () => {
  const db = usePGlite()
  const syncsRef = useRef([])
  const sqlInitializing = useAtomValue(sqlInitializingAtom)

  const { user: authUser } = useCorbado()

  // TODO: ensure syncing resumes after user has changed

  useEffect(() => {
    if (!db) return
    if (sqlInitializing) return

    if (!syncsRef.current.length) {
      startSyncingSingly(db).then((syncs) => {
        syncsRef.current = syncs
      })
    }

    return () => {
      if (syncsRef.current.length) {
        console.log('SyncerProjects unsubscribing sync')
        syncsRef.current.forEach((s) => s.unsubscribe && s.unsubscribe?.())
        syncsRef.current = []
      }
    }
  }, [authUser?.email, db, sqlInitializing])

  return null
}
