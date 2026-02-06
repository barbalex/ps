import { useEffect, useRef } from 'react'
import { useAtomValue } from 'jotai'

import { sqlInitializingAtom } from '../store.ts'
import { startSyncing } from '../modules/startSyncing.ts'
// import { startSyncingUsersOnly } from '../modules/startSyncingUsersOnly.ts'
// import { startSyncingSingly } from '../modules/startSyncingSingly.ts'

export const Syncer = () => {
  const sqlInitializing = useAtomValue(sqlInitializingAtom)
  const syncRef = useRef(null)

  // TODO: ensure syncing resumes after user has changed

  useEffect(() => {
    if (sqlInitializing) {
      console.log('Syncer: SQL initializing, returning')
      return
    }

    console.log('Syncer: Starting sync...')

    startSyncing()
      .then((syncObj) => {
        console.log('Syncer: Sync started successfully')
        syncRef.current = syncObj
      })
      .catch((error) => {
        console.error('Syncer: Error starting sync:', error)
        // Reset flags on error so user can retry
      })

    return () => {
      console.log('Syncer: Cleanup running')
      // unsubscribe from sync when component unmounts
      if (syncRef.current) {
        console.log('Syncer: Unsubscribing from sync')
        syncRef.current?.unsubscribe?.()
        syncRef.current = null
      }
    }
  }, [sqlInitializing]) // removed authUser?.email to prevent restarts. TODO: revisit when implementing auth (user switching)

  return null
}
