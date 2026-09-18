import { useEffect } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'
import { useAtomValue, useSetAtom } from 'jotai'

import {
  initialSyncingAtom,
  onlineAtom,
  sqlInitializingAtom,
  store,
  syncObjectAtom,
} from '../store.ts'
import { bootTrace } from '../modules/bootTrace.ts'

// Ends the initial-sync boot phase once this page load's sync has really
// settled. pglite-sync's promise resolves as soon as the streams are
// SUBSCRIBED, not when data is applied, and Electric may clear and re-snapshot
// a table at any time until its shape is up-to-date. Live queries can't be
// trusted to notice either arrival or refill (the session runs in replica
// mode, which disables the live extension's notify triggers), so this polls
// the sync object's `isUpToDate` property instead: it only turns true once
// EVERY shape has received its up-to-date marker, i.e. all snapshots and
// refetches have been applied.
const InitialSyncWatcher = () => {
  const db = usePGlite()
  const setInitialSyncing = useSetAtom(initialSyncingAtom)
  const sqlInitializing = useAtomValue(sqlInitializingAtom)

  useEffect(() => {
    if (sqlInitializing) return

    let released = false
    const release = (reason: string) => {
      if (released) return
      released = true
      bootTrace(`initial sync phase released: ${reason}`)
      setInitialSyncing(false)
    }

    const tick = async () => {
      const syncObject = store.get(syncObjectAtom) as {
        isUpToDate?: boolean
      } | null
      if (syncObject?.isUpToDate) {
        release('all shapes up to date')
        return
      }
      // While offline no sync object is created; local data is all there is
      if (!syncObject && !store.get(onlineAtom)) {
        try {
          const res = await db.query<{ exists: boolean }>(
            `SELECT EXISTS (SELECT 1 FROM projects LIMIT 1) AS exists`,
          )
          if (res.rows[0]?.exists) {
            release('offline, data present locally')
            return
          }
          // offline on a first run without local data: only the timeout
          // below can release us
        } catch {
          // table may not exist yet — keep polling
        }
      }
    }

    const interval = setInterval(tick, 400)
    void tick()
    // Never leave the user stuck on the boot screen forever, whatever goes
    // wrong with the sync (server down, hanging streams, …)
    const timeout = setTimeout(() => release('90s fallback'), 90_000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [db, setInitialSyncing, sqlInitializing])

  return null
}

export const InitialSyncManager = () => {
  const sqlInitializing = useAtomValue(sqlInitializingAtom)

  // The watcher queries the projects table, which only exists once SQL
  // initialization has created the schema.
  if (sqlInitializing) return null
  return <InitialSyncWatcher />
}
