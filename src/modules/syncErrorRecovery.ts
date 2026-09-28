/**
 * Self-healing for foreign-key violations during the Electric sync.
 *
 * pglite-sync applies shape data in its own transactions; a child row whose
 * parent has not arrived in any applied transaction fails at that
 * transaction's commit — surfacing as an unhandled rejection inside the
 * pglite worker, NOT through the adapter's onError. Left alone, the sync
 * stays aborted while reporting "up to date": a permanently empty app.
 *
 * The staged initial sync (syncStages.ts) prevents the deterministic case;
 * this catches the rare live-tail race: the worker reports the violation
 * over a BroadcastChannel and the page reloads once per session. A reload
 * re-runs the staged sync; existing rows are skipped by the duplicate-guard
 * trigger, so the cost equals a normal cold start.
 */

const CHANNEL = 'ps-sync-error'
const RECOVERY_FLAG = 'ps-sync-fk-recovery'

const isForeignKeyViolation = (reason: unknown) =>
  String(reason ?? '').includes('violates foreign key constraint')

let armed = false

/** forwards unhandled FK rejections from the worker to the page (no-op outside a worker) */
export const reportSyncRejectionsFromWorker = () => {
  // in a worker there is no window; on the page there is
  if (typeof window !== 'undefined' || typeof self === 'undefined') return
  self.addEventListener('unhandledrejection', (event) => {
    if (!isForeignKeyViolation((event as PromiseRejectionEvent).reason)) return
    try {
      const channel = new BroadcastChannel(CHANNEL)
      channel.postMessage({ type: 'fk-violation', reason: String((event as PromiseRejectionEvent).reason).slice(0, 300) })
      channel.close()
    } catch {
      // the page also logs unhandled rejections itself
    }
  })
}

/** reloads the page once per session when the worker reports an FK violation */
export const armSyncErrorRecovery = () => {
  if (armed) return
  armed = true

  try {
    if (sessionStorage.getItem(RECOVERY_FLAG)) return
  } catch {
    return
  }

  const channel = new BroadcastChannel(CHANNEL)
  channel.onmessage = (event) => {
    const data = event.data as { type?: string }
    if (data?.type !== 'fk-violation') return
    console.error('Electric sync: foreign key violation — reloading once to re-sync in stage order')
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
