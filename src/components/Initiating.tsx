import { useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'

import {
  initialSyncingAtom,
  pgliteDbAtom,
  sqlInitializingAtom,
} from '../store.ts'
import { useMarkBootDone } from '../modules/bootDone.ts'
import styles from './Initiating.module.css'

const Spinner = () => (
  <svg
    className={styles.spinner}
    width="24"
    height="24"
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

  // Keep the loading UI visible until local DB initialization and initial
  // server sync are complete.
  if (pgliteDb && !sqlInitializing && !initialSyncing) return null

  // phase 1 "Preparing": app boot, auth check and PGlite instantiation
  const prepDone = !!pgliteDb
  // phase 2 "Initializing": creating/checking the local schema
  const initDone = prepDone && !sqlInitializing
  // phase 3 "Syncing": initial sync with the server
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
          <div className={`${styles.step} ${stepState(prepDone, !prepDone)}`}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepLabel}>
              {formatMessage({
                id: 'prepDbStepLabel',
                defaultMessage: 'Vorbereiten',
              })}
            </span>
            {!prepDone && <Spinner />}
            {prepDone && <DoneIcon />}
          </div>
          <div
            className={`${styles.step} ${stepState(initDone, prepDone && !initDone)}`}
          >
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepLabel}>
              {formatMessage({
                id: 'initDbStepLabel',
                defaultMessage: 'Initialisiere Datenbank',
              })}
            </span>
            {prepDone && !initDone && <Spinner />}
            {initDone && <DoneIcon />}
          </div>
          <div
            className={`${styles.step} ${stepState(!syncActive && initDone, syncActive)}`}
          >
            <span className={styles.stepNumber}>3</span>
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
