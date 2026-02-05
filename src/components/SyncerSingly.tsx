import { useEffect, useRef } from 'react'
import { useCorbado } from '@corbado/react'
import { useAtomValue } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { sqlInitializingAtom } from '../store.ts'
import { startSyncingSingly } from '../modules/startSyncingSingly.ts'

export const SyncerSingly = () => {
  const db = usePGlite()
  const syncsRef = useRef([])
  const isStartingRef = useRef(false)
  const sqlInitializing = useAtomValue(sqlInitializingAtom)

  const { user: authUser } = useCorbado()

  // TODO: ensure syncing resumes after user has changed

  useEffect(() => {
    if (!db) return
    if (sqlInitializing) return
    if (syncsRef.current.length > 0 || isStartingRef.current) return // Don't start if already syncing or starting

    isStartingRef.current = true

    startSyncingSingly(db)
      .then((syncObjs) => {
        syncsRef.current = syncObjs
        isStartingRef.current = false
      })
      .catch((error) => {
        console.error('SyncerSingly: Error starting sync:', error)
        isStartingRef.current = false
      })

    return () => {
      if (syncsRef.current.length > 0) {
        console.log('SyncerProjects unsubscribing sync')
        syncsRef.current.forEach((s) => s.unsubscribe?.())
        syncsRef.current = []
      }
      isStartingRef.current = false
    }
  }, [authUser?.email, db, sqlInitializing])

  return null
}
