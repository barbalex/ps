import { useEffect } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'
import { useAtomValue, useSetAtom } from 'jotai'

import {
  initialSyncingAtom,
  onlineAtom,
  sqlInitializingAtom,
  store,
  syncLeaderAtom,
  syncObjectAtom,
} from '../store.ts'
import { bootTrace } from '../modules/bootTrace.ts'
import type { PsSyncObject } from '../modules/startSyncing.ts'

// no stream offset advanced and no stage apply was running for this long:
// the sync is stuck (server unreachable on a first run, hung streams, …)
const INACTIVITY_FALLBACK_MS = 90_000
// a running apply counts as progress, so a hung worker needs its own bound
const HARD_CAP_MS = 15 * 60_000

// Ends the initial-sync boot phase once this page load's sync has really
// settled. pglite-sync's promise resolves as soon as the streams are
// SUBSCRIBED, not when data is applied, and its `isUpToDate` flips when the
// up-to-date marker is RECEIVED — before the apply transaction has
// committed, which for a large dataset can be a minute later. Live queries
// can't be trusted to notice the arrival either (sync applies don't notify,
// see gateLiveNotifyTriggers), so this polls the aggregate sync object's
// `isApplied`: it only turns true once EVERY stage's onInitialSync fired,
// i.e. all snapshots are committed and the UI will find the rows.
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

    // progress signature: stream offsets plus whether an apply is running.
    // The fallback only fires after a quiet period — a big snapshot being
    // applied is progress, even though no offset moves meanwhile
    let lastSignature = ''
    let lastProgressAt = Date.now()
    const startedAt = Date.now()

    const tick = async () => {
      const syncObject = store.get(syncObjectAtom) as PsSyncObject | null
      if (syncObject?.isApplied) {
        release('all stages applied')
        return
      }
      if (Date.now() - startedAt > HARD_CAP_MS) {
        release(`${HARD_CAP_MS / 60_000}min hard cap`)
        return
      }
      if (syncObject) {
        const offsets = Object.values(syncObject.streams ?? {})
          .map(
            (stream) => (stream as { lastOffset?: string }).lastOffset ?? '',
          )
          .join('|')
        const signature = `${offsets}#${syncObject.isApplying ? 'applying' : ''}`
        if (signature !== lastSignature || syncObject.isApplying) {
          lastSignature = signature
          lastProgressAt = Date.now()
        }
      }
      if (Date.now() - lastProgressAt > INACTIVITY_FALLBACK_MS) {
        // never leave the user on the boot screen forever, whatever went
        // wrong with the sync (server down, hanging streams, …)
        release(`${INACTIVITY_FALLBACK_MS / 1000}s without sync progress`)
        return
      }
      // While offline no sync object is created; local data is all there
      // is. A non-leader tab does not sync either: the leader tab keeps the
      // shared database current.
      if (
        !syncObject &&
        (!store.get(onlineAtom) || !store.get(syncLeaderAtom))
      ) {
        try {
          const res = await db.query<{ exists: boolean }>(
            `SELECT EXISTS (SELECT 1 FROM projects LIMIT 1) AS exists`,
          )
          if (res.rows[0]?.exists) {
            release(
              store.get(onlineAtom) ?
                'non-leader tab, data present locally'
              : 'offline, data present locally',
            )
            return
          }
          // offline on a first run without local data: only the inactivity
          // fallback above can release us
        } catch {
          // table may not exist yet — keep polling
        }
      }
    }

    const interval = setInterval(tick, 400)
    void tick()

    return () => {
      clearInterval(interval)
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
