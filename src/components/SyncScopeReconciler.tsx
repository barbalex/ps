import { useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import {
  addNotificationAtom,
  initialSyncingAtom,
  onlineAtom,
} from '../store.ts'
import { reconcileSyncScope } from '../modules/reconcileSyncScope.ts'
import { useSession } from '../modules/authClient.ts'

// a revoked role is rare; a periodic check plus a check whenever the tab
// comes back keeps the local data within scope without a page reload
const INTERVAL_MS = 10 * 60_000
const SETTLE_DELAY_MS = 5_000

export const SyncScopeReconciler = () => {
  const { formatMessage } = useIntl()
  const initialSyncing = useAtomValue(initialSyncingAtom)
  const online = useAtomValue(onlineAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const { data: session } = useSession()
  const isAuthenticated = Boolean(session?.user)

  useEffect(() => {
    if (!isAuthenticated || !online || initialSyncing) return

    let cancelled = false
    let running = false

    const run = async () => {
      if (cancelled || running) return
      running = true
      try {
        const pruned = await reconcileSyncScope()
        if (cancelled || !pruned) return
        if (pruned.projects + pruned.subprojects + pruned.places === 0) return
        addNotification({
          title: formatMessage({
            id: 'syncScopeReducedTitle',
            defaultMessage: 'Zugriff geändert',
          }),
          body: formatMessage({
            id: 'syncScopeReducedBody',
            defaultMessage:
              'Daten, auf die Sie keinen Zugriff mehr haben, wurden lokal entfernt.',
          }),
          intent: 'info',
          duration: 10_000,
        })
      } catch (error) {
        // offline or server error: the next run retries
        console.warn('reconcileSyncScope failed', error)
      } finally {
        running = false
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') void run()
    }

    const settleTimer = setTimeout(() => void run(), SETTLE_DELAY_MS)
    const interval = setInterval(() => void run(), INTERVAL_MS)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      clearTimeout(settleTimer)
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [addNotification, formatMessage, initialSyncing, isAuthenticated, online])

  return null
}
