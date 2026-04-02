import { useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'

import { sqlInitializingAtom, syncObjectAtom } from '../store.ts'
import { startSyncing } from '../modules/startSyncing.ts'
// import { startSyncingUsersOnly } from '../modules/startSyncingUsersOnly.ts'
// import { startSyncingSingly } from '../modules/startSyncingSingly.ts'

export const Syncer = () => {
  const sqlInitializing = useAtomValue(sqlInitializingAtom)
  const syncObject = useAtomValue(syncObjectAtom)
  const setSyncObject = useSetAtom(syncObjectAtom)

  // TODO: ensure syncing resumes after user has changed
  useEffect(() => {
    if (sqlInitializing) return
    if (syncObject) {
      console.warn('Sync already initialized, skipping')
      return
    }

    startSyncing()
      .then((syncObj) => {
        console.log('Sync started')
        setSyncObject(syncObj)
      })
      .catch((error) => {
        console.error('Error starting sync:', error)
        // Reset flags on error so user can retry
      })
  }, [sqlInitializing, syncObject, setSyncObject]) // removed authUser?.email to prevent restarts. TODO: revisit when implementing auth (user switching)

  return null
}
