/**
 * Self-healing for apply violations during the Electric sync.
 *
 * pglite-sync applies shape data in its own transactions; a child row whose
 * parent has not arrived in any applied transaction (foreign key violation)
 * or a row whose unique constraint is already taken locally — e.g. an insert
 * racing the delete of its replaced predecessor (unique violation) — fails
 * at that transaction's commit. These surface as unhandled rejections inside
 * the pglite worker, NOT through the adapter's onError. Left alone, the sync
 * stays aborted while reporting "up to date": a permanently empty app.
 *
 * The staged initial sync (syncStages.ts) prevents the deterministic case;
 * this catches the rare live-tail race: the worker reports the violation
 * over a BroadcastChannel and the page reloads once per completed sync. A
 * reload re-runs the staged sync; existing rows are skipped by the
 * duplicate-guard trigger and subquery shapes (roles) are never resumed
 * incrementally but re-snapshotted, clearing their table — so the healing
 * equals a normal cold start.
 */

const CHANNEL = 'ps-sync-error'
const RECOVERY_FLAG = 'ps-sync-fk-recovery'

const isRecoverableSyncViolation = (reason: unknown) => {
  const text = String(reason ?? '')
  return (
    text.includes('violates foreign key constraint') ||
    text.includes('duplicate key value violates unique constraint')
  )
}

let armed = false

/** forwards unhandled sync rejections from the worker to the page (no-op outside a worker) */
export const reportSyncRejectionsFromWorker = () => {
  // in a worker there is no window; on the page there is
  if (typeof window !== 'undefined' || typeof self === 'undefined') return
  self.addEventListener('unhandledrejection', (event) => {
    if (!isRecoverableSyncViolation((event as PromiseRejectionEvent).reason))
      return
    try {
      const channel = new BroadcastChannel(CHANNEL)
      channel.postMessage({
        type: 'apply-violation',
        reason: String((event as PromiseRejectionEvent).reason).slice(0, 300),
      })
      channel.close()
    } catch {
      // the page also logs unhandled rejections itself
    }
  })
}

/** reloads the page once per completed sync when the worker reports an apply violation */
export const armSyncErrorRecovery = () => {
  if (armed) return
  armed = true

  const channel = new BroadcastChannel(CHANNEL)
  channel.onmessage = (event) => {
    const data = event.data as { type?: string }
    if (data?.type !== 'apply-violation') return
    // the flag is checked at message time (not setup time) so recovery
    // re-arms after every successfully completed sync
    try {
      if (sessionStorage.getItem(RECOVERY_FLAG)) return
    } catch {
      return
    }
    console.error(
      'Electric sync: apply violation — reloading once to re-sync in stage order',
    )
    try {
      sessionStorage.setItem(RECOVERY_FLAG, '1')
    } catch {
      // without session storage the flag cannot guard against a loop
      return
    }
    channel.close()
    window.location.reload()
  }
}

/** called when an initial sync completes: allow one more recovery reload for later violations */
export const syncRecovered = () => {
  try {
    sessionStorage.removeItem(RECOVERY_FLAG)
  } catch {
    // no session storage, nothing to clear
  }
}
