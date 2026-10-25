import { useEffect, useRef } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import {
  addNotificationAtom,
  backgroundSyncingAtom,
  initialSyncingAtom,
  pgliteDbAtom,
  store,
  syncObjectAtom,
  updateNotificationAtom,
} from '../store.ts'
import { notifyAllLiveTables } from '../modules/gateLiveNotifyTriggers.ts'

// Shows a spinner notification while a post-boot sync applies a sustained
// amount of data. Even with the database in a web worker, large batches keep
// the page busy (stream parsing, live-query re-renders), so the user should
// know why the UI may react sluggishly. The boot phase is excluded — it has
// its own splash screen and Syncer notification.
const POLL_INTERVAL_MS = 2000
// single-row live changes flip isUpToDate only briefly and must not flicker
// the indicator; only sustained catch-up work (re-snapshots, bulk changes) does
const THRESHOLD_MS = 3000
// paused notifications are removed after `duration` regardless of their pause
// state, so keep it long enough for any realistic catch-up; completion flips
// paused to false, which removes the notification after 500ms
const DURATION_MS = 30 * 60_000

export const BackgroundSyncIndicator = () => {
  const { formatMessage } = useIntl()
  const initialSyncing = useAtomValue(initialSyncingAtom)
  const setBackgroundSyncing = useSetAtom(backgroundSyncingAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const updateNotification = useSetAtom(updateNotificationAtom)
  const notificationIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (initialSyncing) return

    let notUpToDateSince: number | null = null
    let wasBackgroundSyncing = false

    const tick = () => {
      const syncObject = store.get(syncObjectAtom) as {
        isUpToDate?: boolean
      } | null

      const notUpToDate = syncObject?.isUpToDate === false

      if (notUpToDate) {
        if (notUpToDateSince === null) notUpToDateSince = Date.now()
      } else {
        // up to date, or no sync object (offline / signed out)
        notUpToDateSince = null
      }

      const backgroundSyncing =
        notUpToDateSince !== null &&
        Date.now() - notUpToDateSince >= THRESHOLD_MS

      if (backgroundSyncing === wasBackgroundSyncing) return
      wasBackgroundSyncing = backgroundSyncing
      setBackgroundSyncing(backgroundSyncing)

      if (!backgroundSyncing) {
        // a SUSTAINED sync just settled: fire one notification round so live
        // queries mounted mid-sync pick up the applied data — sync applies
        // themselves no longer notify (gateLiveNotifyTriggers). Only on the
        // sustained transition: isUpToDate oscillates on every live long-poll
        // cycle, and a kick re-runs EVERY mounted live query.
        const db = store.get(pgliteDbAtom)
        // errors are irrelevant here: the next settle will retry
        if (db) void notifyAllLiveTables(db).catch(() => undefined)
      }

      if (backgroundSyncing) {
        const id = addNotification({
          title: formatMessage({
            id: 'syncInBackgroundTitle',
            defaultMessage: 'Synchronisiere im Hintergrund',
          }),
          body: formatMessage({
            id: 'syncInBackgroundBody',
            defaultMessage:
              'Daten werden aktualisiert. Die Oberfläche kann einfrieren.',
          }),
          intent: 'info',
          paused: true,
          duration: DURATION_MS,
        }) as string | undefined
        notificationIdRef.current = id ?? null
      } else {
        const id = notificationIdRef.current
        notificationIdRef.current = null
        if (!id) return
        updateNotification({
          id,
          draft: {
            intent: 'success',
            paused: false,
            body: formatMessage({
              id: 'syncServerTaskDone',
              defaultMessage: 'Synchronisation abgeschlossen.',
            }),
          },
        })
      }
    }

    const interval = setInterval(tick, POLL_INTERVAL_MS)
    void tick()

    return () => {
      clearInterval(interval)
      setBackgroundSyncing(false)
    }
  }, [
    addNotification,
    formatMessage,
    initialSyncing,
    setBackgroundSyncing,
    updateNotification,
  ])

  return null
}
