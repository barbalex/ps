import { useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'

import {
  firstRunDbInitAtom,
  initialSyncingAtom,
  pgliteDbAtom,
  sqlInitializingAtom,
} from '../store.ts'
import { useMarkBootDone } from '../modules/bootDone.ts'
import styles from './Initiating.module.css'

const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={className ?? styles.spinner}
    width="48"
    height="48"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="8"
      cy="8"
      r="6.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      opacity="0.2"
    />
    <circle
      cx="8"
      cy="8"
      r="6.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeDasharray="10.2 20.4"
      strokeLinecap="round"
    />
  </svg>
)

const DoneIcon = () => (
  <svg
    className={styles.stepIcon}
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="7" fill="#287e4a" />
    <path
      d="M4.5 8.25l2.5 2.5 4-5"
      stroke="#fff"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// memoizing this component creates error
export const Initiating = () => {
  useMarkBootDone()
  const { formatMessage } = useIntl()
  const pgliteDb = useAtomValue(pgliteDbAtom)
  const sqlInitializing = useAtomValue(sqlInitializingAtom)
  const initialSyncing = useAtomValue(initialSyncingAtom)
  const firstRunDbInit = useAtomValue(firstRunDbInitAtom)

  // While the boot is still pending, always show a spinner. This component
  // is also used as the router's pendingComponent (while beforeLoad checks
  // auth and opens the database), where returning null would produce a
  // blank screen. When it is used inside AuthAndDb, the flags flipping to
  // false unmounts it in the same render, so the spinner is never seen there.
  if (pgliteDb && !sqlInitializing && !initialSyncing) {
    return (
      <div className={styles.container}>
        <Spinner className={styles.spinnerAlone} />
      </div>
    )
  }

  // The "Building local database" card only makes sense when the database
  // is actually being created for the first time this page load. On reloads
  // of an existing database (or with stale persisted init flags) show a
  // plain spinner instead.
  if (!pgliteDb || !firstRunDbInit) {
    return (
      <div className={styles.container}>
        <Spinner className={styles.spinnerAlone} />
        {import.meta.env.DEV && (
          <div
            data-boot-flags
            style={{
              position: 'fixed',
              bottom: 8,
              left: 8,
              font: '11px monospace',
              background: '#ff0',
              padding: '2px 6px',
              zIndex: 99998,
            }}
          >
            db={String(!!pgliteDb)} sql={String(sqlInitializing)} sync=
            {String(initialSyncing)} firstRun={String(firstRunDbInit)}
          </div>
        )}
      </div>
    )
  }

  // the card only renders with the database open, so the boot phase is
  // already done: show the two phases that involve actual work
  const initDone = !sqlInitializing
  // phase "Syncing": initial sync with the server
  const syncActive = initDone && initialSyncing

  const stepState = (done: boolean, active: boolean) =>
    done ? styles.stepDone : active ? styles.stepActive : styles.stepPending

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <p className={styles.title}>
          {formatMessage({
            id: 'initDbMsg',
            defaultMessage: 'Baue lokale Datenbank',
          })}
        </p>
        <p className={styles.subtitle}>
          {formatMessage({
            id: 'initDbHintMsg',
            defaultMessage: 'Nur beim ersten Start nötig',
          })}
        </p>
        <div className={styles.steps}>
          <div className={`${styles.step} ${stepState(initDone, !initDone)}`}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepLabel}>
              {formatMessage({
                id: 'initDbStepLabel',
                defaultMessage: 'Initialisiere Datenbank',
              })}
            </span>
            {!initDone && <Spinner />}
            {initDone && <DoneIcon />}
          </div>
          <div
            className={`${styles.step} ${stepState(!syncActive && initDone, syncActive)}`}
          >
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepLabel}>
              {formatMessage({
                id: 'syncServerStepLabel',
                defaultMessage: 'Synchronisiere mit dem Server',
              })}
            </span>
            {syncActive && <Spinner />}
            {initDone && !syncActive && <DoneIcon />}
          </div>
        </div>
      </div>
    </div>
  )
}
