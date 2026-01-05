import { useEffect, useState } from 'react'
import { useCorbado } from '@corbado/react'
import { useAtomValue } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { sqlInitializingAtom } from '../store.ts'
import { startSyncingSingly } from '../modules/startSyncingSingly.ts'

export const SyncerSingly = () => {
  const db = usePGlite()
  const [syncs, setSyncs] = useState([])
  const sqlInitializing = useAtomValue(sqlInitializingAtom)

  const { user: authUser } = useCorbado()

  // TODO: ensure syncing resumes after user has changed

  useEffect(() => {
    if (!db) return
    if (sqlInitializing) return

    if (!syncs.length) startSyncingSingly(db).then((sync) => setSyncs(sync))

    return () => {
      !!syncs.length && console.log('SyncerProjects unsubscribing sync')
      syncs.forEach((s) => s.unsubscribe && s.unsubscribe?.())
    }
  }, [authUser?.email, db, syncs, sqlInitializing])

  return null
}
