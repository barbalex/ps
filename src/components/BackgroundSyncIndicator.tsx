import { useEffect, useRef, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import {
  addNotificationAtom,
  backgroundSyncingAtom,
  initialSyncingAtom,
  onlineAtom,
  pgliteDbAtom,
  store,
  syncObjectAtom,
  updateNotificationAtom,
} from '../store.ts'
import { notifyAllLiveTables } from '../modules/gateLiveNotifyTriggers.ts'

// TODO(debug): temporary dev-only table counts to diagnose empty reads after
// sync — remove once the live-query staleness issue is resolved
const DebugCounts = () => {
  const db = useAtomValue(pgliteDbAtom)
  const [counts, setCounts] = useState('')
  useEffect(() => {
    if (!db || !import.meta.env.DEV) return
    const read = async () => {
      try {
        const r = await db.query(
          `SELECT (SELECT count(*) FROM projects) AS projects, (SELECT count(*) FROM users) AS users, (SELECT count(*) FROM vector_layers) AS vl, (SELECT count(*) FROM places) AS places`,
        )
        const syncObject = store.get(syncObjectAtom) as {
          isUpToDate?: boolean
          isApplied?: boolean
        } | null
        setCounts(
          JSON.stringify(r.rows[0]) +
            ` sync:${syncObject ? (syncObject.isUpToDate ? 'uptodate' : 'catchingup') : 'none'}` +
            ` applied:${syncObject?.isApplied ?? '-'} leader:${(db as { isLeader?: boolean }).isLeader ?? '-'}` +
            ` online:${store.get(onlineAtom)}`,
        )
      } catch {
        setCounts('(query failed)')
      }
    }
    void read()
    const t = setInterval(read, 3000)
    return () => clearInterval(t)
  }, [db])
  if (!counts) return null
  return (
    <div
      data-debug-counts
      style={{
        position: 'fixed',
        bottom: 8,
        right: 8,
        font: '11px monospace',
        background: '#ff0',
        padding: '2px 6px',
        zIndex: 99999,
      }}
    >
      {counts}
    </div>
  )
}

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
            defaultMessage: 'Die Oberfläche kann einfrieren.',
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

  return (
    <>
      <DebugCounts />
    </>
  )
}
