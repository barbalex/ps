import type { PGlite } from '@electric-sql/pglite'

/**
 * Multi-tab: PGliteWorker elects one leader tab per database; the other tabs
 * proxy their queries to it. The electric namespace, however, is set up on
 * the client side of every tab, so without a gate every open tab would run
 * its own copy of all shape streams against the shared database. Only the
 * leader tab syncs; it also forwards NOTIFYs to the other tabs, so their
 * live queries still refresh.
 *
 * `isLeader` flips to true when this tab's worker takes over after the
 * previous leader closed. PGliteWorker only emits `leader-change` for the
 * losing side, hence the polling.
 */

type LeaderAwareDb = {
  isLeader?: boolean
  onLeaderChange?: (callback: () => void) => () => void
}

export const isSyncLeader = (db: PGlite | null) => {
  const leader = (db as LeaderAwareDb | null)?.isLeader
  // a non-worker PGlite (tests, fallbacks) has no election: it is the leader
  return leader === undefined ? true : leader
}

const POLL_MS = 1000

/** calls back whenever this tab's leadership changes; returns the unsubscribe */
export const watchSyncLeader = (
  db: PGlite,
  callback: (isLeader: boolean) => void,
) => {
  let last = isSyncLeader(db)
  const check = () => {
    const next = isSyncLeader(db)
    if (next === last) return
    last = next
    callback(next)
  }
  const unsubscribe = (db as LeaderAwareDb).onLeaderChange?.(check)
  const timer = setInterval(check, POLL_MS)
  return () => {
    clearInterval(timer)
    unsubscribe?.()
  }
}
