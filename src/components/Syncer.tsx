import { useEffect, useState, useCallback } from 'react'
import { useCorbado } from '@corbado/react'
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { syncingAtom } from '../store.ts'
import { startSyncing } from '../modules/startSyncing.ts'

export const Syncer = () => {
  const db = usePGlite()
  const [sync, setSync] = useState(null)

  const setSyncing = useSetAtom(syncingAtom)
  setSyncing(true)

  const { user: authUser } = useCorbado()

  const unsubscribe = useCallback(() => sync?.unsubscribe?.(), [sync])

  useEffect(() => {
    if (!db) return
    if (!setSyncing) return
    if (!setSync) return
    if (!unsubscribe) return

    startSyncing({ db, setSyncing, setSync })

    return () => {
      console.log('AuthAndDb.Syncer unsubscribing sync')
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.email, db, setSyncing, setSync])

  return null
}
