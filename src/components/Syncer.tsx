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
    if (sqlInitializing) return

    startSyncing()
      .then((syncObj) => {
        console.log('Sync started')
        syncRef.current = syncObj
      })
      .catch((error) => {
        console.error('Error starting sync:', error)
        // Reset flags on error so user can retry
      })

    return () => {
      // unsubscribe from sync when component unmounts
      if (syncRef.current) {
        console.log('Unsubscribing from sync')
        syncRef.current?.unsubscribe?.()
        syncRef.current = null
      }
    }
  }, [sqlInitializing]) // removed authUser?.email to prevent restarts. TODO: revisit when implementing auth (user switching)

  return null
}
