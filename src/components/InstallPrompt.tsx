import { useEffect, useState } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useIntl } from 'react-intl'

import { isDesktopViewAtom } from '../store.ts'
import styles from './InstallPrompt.module.css'

// BeforeInstallPromptEvent is not part of lib.dom's typings
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// a dismissed banner returns after 30 days
const snoozeMs = 30 * 24 * 60 * 60 * 1000

const dismissedAtMsAtom = atomWithStorage<number>(
  'installPromptDismissedAtMs',
  0,
  undefined,
  // getOnInit: read localStorage synchronously so users who dismissed
  // the banner never see it flash on the next load
  { getOnInit: true },
)

const isStandaloneApp = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as { standalone?: boolean }).standalone === true

// iPadOS masquerades as desktop Safari since iOS 13
const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1)

// nudges mobile users to install the app: on iOS the installed app is
// exempt from Safari's 7-day storage purge, everywhere else an install
// makes storage eviction practically impossible — see
// dev-documentation.md §13
export const InstallPrompt = () => {
  const { formatMessage } = useIntl()
  const isDesktopView = useAtomValue(isDesktopViewAtom)
  const [dismissedAtMs, setDismissedAtMs] = useAtom(dismissedAtMsAtom)
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(
    null,
  )
  const [isStandalone] = useState(isStandaloneApp)
  const [ios] = useState(isIos)

  useEffect(() => {
    if (isStandalone) return
    const onBeforeInstallPrompt = (event: Event) => {
      // keep the browser's own install banner from appearing too
      event.preventDefault()
      setPromptEvent(event as InstallPromptEvent)
    }
    const onAppInstalled = () => setDismissedAtMs(Date.now())
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [isStandalone, setDismissedAtMs])

  const install = async () => {
    if (!promptEvent) return
    setPromptEvent(null)
    await promptEvent.prompt()
    // resolves once the user has acted on the browser's install dialog
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'dismissed') setDismissedAtMs(Date.now())
  }

  const isSnoozed = dismissedAtMs > 0 && Date.now() - dismissedAtMs < snoozeMs
  const showInstallButton = promptEvent !== null
  // iOS never fires beforeinstallprompt: there the banner shows
  // share-menu instructions instead of a button
  const visible =
    !isDesktopView && !isStandalone && !isSnoozed && (showInstallButton || ios)

  if (!visible) return null

  return (
    <div className={styles.container}>
      <p className={styles.message}>
        {formatMessage({
          id: 'installPromptMsg',
          defaultMessage:
            'App installieren – dann bleiben die Daten auf dem Gerät erhalten und die App funktioniert offline.',
        })}
      </p>
      <div className={styles.actions}>
        {showInstallButton ? (
          <button type="button" className={styles.button} onClick={install}>
            {formatMessage({
              id: 'installPromptBtn',
              defaultMessage: 'Installieren',
            })}
          </button>
        ) : (
          <p className={styles.hint}>
            {formatMessage({
              id: 'installPromptIosHint',
              defaultMessage:
                'Teilen antippen, dann „Zum Home-Bildschirm hinzufügen“ wählen.',
            })}
          </p>
        )}
        <button
          type="button"
          className={styles.dismiss}
          aria-label={formatMessage({
            id: 'installPromptDismiss',
            defaultMessage: 'Schliessen',
          })}
          onClick={() => setDismissedAtMs(Date.now())}
        >
          ×
        </button>
      </div>
    </div>
  )
}
