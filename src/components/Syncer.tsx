import { useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'

import { sqlInitializingAtom, syncObjectAtom } from '../store.ts'
import { startSyncing } from '../modules/startSyncing.ts'
import { useSession } from '../modules/authClient.ts'

export const Syncer = () => {
  const sqlInitializing = useAtomValue(sqlInitializingAtom)
  const syncObject = useAtomValue(syncObjectAtom)
  const setSyncObject = useSetAtom(syncObjectAtom)
  const { data: session, isPending } = useSession()
  const isAuthenticated = Boolean(session?.user)

  // TODO: ensure syncing resumes after user has changed
  useEffect(() => {
    if (isPending) return
    if (!isAuthenticated) return
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
  }, [isAuthenticated, isPending, sqlInitializing, syncObject, setSyncObject])

  return null
}
