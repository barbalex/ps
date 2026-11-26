import { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'

import { version as appVersion } from '../../../package.json'
import { prepareAppUpdate } from './prepareAppUpdate.ts'

import styles from './index.module.css'

const DISMISSED_KEY = 'versionCheckDismissedVersion'
const UPDATE_PENDING_KEY = 'versionCheckUpdatePending'
const RECHECK_INTERVAL_MS = 15 * 60 * 1000
// the update handshake gives up after this many extra reloads or this
// much time — a stubborn service worker must not be able to trap the
// app in a reload loop
const MAX_UPDATE_ATTEMPTS = 3
const GIVE_UP_AFTER_MS = 5 * 60 * 1000

interface PendingUpdate {
  target: string
  attempts: number
  startedAt: number
}

const readPendingUpdate = (): PendingUpdate | null => {
  try {
    const raw = localStorage.getItem(UPDATE_PENDING_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PendingUpdate>
    if (typeof parsed.target !== 'string') return null
    return {
      target: parsed.target,
      attempts: typeof parsed.attempts === 'number' ? parsed.attempts : 0,
      startedAt:
        typeof parsed.startedAt === 'number' ? parsed.startedAt : Date.now(),
    }
  } catch {
    return null
  }
}

const writePendingUpdate = (pending: PendingUpdate) => {
  localStorage.setItem(UPDATE_PENDING_KEY, JSON.stringify(pending))
}

// true while a started update still needs this bundle to act on it:
// the running bundle is not the target yet and the handshake has
// neither exhausted its attempts nor timed out
const isUpdateInFlight = (pending: PendingUpdate | null): boolean =>
  pending !== null &&
  pending.target !== appVersion &&
  pending.attempts < MAX_UPDATE_ATTEMPTS &&
  Date.now() - pending.startedAt <= GIVE_UP_AFTER_MS

/**
 * The service worker can keep a stale bundle running for days
 * (registerType: 'autoUpdate' only swaps in after a reload). This
 * banner compares the running version against /version.json (emitted
 * by vite.config.ts, never cached by sw or Netlify) and offers a
 * worker update. Stale clients otherwise fail silently against
 * the api. Ported from apflora (apf2).
 *
 * The replacement worker activates before we reload. The handshake survives
 * reloads in localStorage and gives up after MAX_UPDATE_ATTEMPTS.
 *
 * A dismissed banner only hides it for as long as this bundle runs —
 * stale clients degrade the shared api for everyone, so the update is
 * forced as soon as the user leaves the app: hiding the tab saves the
 * focused field, nothing typed is lost in the reload.
 */
export const VersionCheck = () => {
  const { formatMessage } = useIntl()
  const [availableVersion, setAvailableVersion] = useState<string | null>(null)
  const pendingVersionRef = useRef<string | null>(null)
  // "später" hides the banner for as long as this bundle runs; the next
  // version starts fresh
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === appVersion,
  )
  // an update started by this or a previous (stale) bundle is in
  // flight; carried across reloads via localStorage
  const [pending, setPending] = useState(readPendingUpdate)
  const [updateFailed, setUpdateFailed] = useState(false)
  const preparing = useRef<Promise<void> | null>(null)

  const update = (target: string) => {
    if (preparing.current) return
    const next = { target, attempts: 0, startedAt: Date.now() }
    writePendingUpdate(next)
    setUpdateFailed(false)
    setPending(next)
  }

  useEffect(() => {
    if (!pending) return
    if (!isUpdateInFlight(pending)) {
      localStorage.removeItem(UPDATE_PENDING_KEY)
      setPending(null)
      return
    }
    let active = true
    preparing.current ??= prepareAppUpdate(navigator.serviceWorker)
    void preparing.current.then(
      () => {
        if (!active) return
        writePendingUpdate({ ...pending, attempts: pending.attempts + 1 })
        window.location.reload()
      },
      (error: unknown) => {
        if (!active) return
        console.error('App update failed', error)
        preparing.current = null
        localStorage.removeItem(UPDATE_PENDING_KEY)
        pendingVersionRef.current = null
        setAvailableVersion(pending.target)
        setDismissed(false)
        setPending(null)
        setUpdateFailed(true)
      },
    )
    return () => {
      active = false
    }
  }, [pending])

  useEffect(() => {
    let active = true
    const check = async () => {
      try {
        const res = await fetch('/version.json', { cache: 'no-store' })
        if (!res.ok || !active) return
        const data = (await res.json()) as { version?: string | undefined }
        if (data.version && data.version !== appVersion) {
          pendingVersionRef.current = data.version
          setAvailableVersion(data.version)
        }
      } catch {
        // dev server has no version.json, offline fetches fail:
        // nothing to compare
      }
    }
    void check()
    const interval = setInterval(() => void check(), RECHECK_INTERVAL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void check()
      } else if (pendingVersionRef.current) {
        void update(pendingVersionRef.current)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      active = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  if (pending && isUpdateInFlight(pending)) {
    return (
      <div
        className={styles.banner}
        role="status"
      >
        <div className={styles.text}>
          {formatMessage({
            id: 'versionCheckUpdating',
            defaultMessage: 'App wird aktualisiert …',
          })}
        </div>
        <div
          className={styles.progress}
          aria-hidden="true"
        >
          <div className={styles.progressBar} />
        </div>
      </div>
    )
  }

  if (!availableVersion || dismissed) return null

  return (
    <div
      className={styles.banner}
      role="alert"
    >
      <div className={styles.text}>
        {updateFailed ?
          formatMessage({
            id: 'versionCheckFailed',
            defaultMessage:
              'Die Aktualisierung ist fehlgeschlagen. Die bisherige Version bleibt verfügbar. Bitte versuchen Sie es erneut.',
          })
        : formatMessage(
            {
              id: 'versionCheckBanner',
              defaultMessage:
                'Eine neue Version ({availableVersion}) von Arten fördern ist verfügbar. Die laufende Version ({appVersion}) ist veraltet und kann Fehler verursachen.',
            },
            { availableVersion, appVersion },
          )
        }
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.button}
          onClick={() => {
            void update(availableVersion)
          }}
        >
          {formatMessage({
            id: 'versionCheckUpdateNow',
            defaultMessage: 'App aktualisieren',
          })}
        </button>
        <button
          type="button"
          className={styles.buttonSecondary}
          onClick={() => {
            localStorage.setItem(DISMISSED_KEY, appVersion)
            setDismissed(true)
          }}
        >
          {formatMessage({
            id: 'versionCheckLater',
            defaultMessage: 'später',
          })}
        </button>
      </div>
    </div>
  )
}
