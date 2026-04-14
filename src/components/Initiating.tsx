import { useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'

import {
  initialSyncingAtom,
  pgliteDbAtom,
  sqlInitializingAtom,
} from '../store.ts'
import styles from './Initiating.module.css'

type InitiatingProps = {
  forceSqlInitializing?: boolean
}

// memoizing this component creates error
export const Initiating = ({
  forceSqlInitializing = false,
}: InitiatingProps) => {
  const { formatMessage } = useIntl()
  const pgliteDb = useAtomValue(pgliteDbAtom)
  const sqlInitializingAtomValue = useAtomValue(sqlInitializingAtom)
  const initialSyncing = useAtomValue(initialSyncingAtom)
  const sqlInitializing = forceSqlInitializing || sqlInitializingAtomValue

  // Keep the loading UI visible until both local DB initialization and
  // initial server sync are complete.
  if (pgliteDb && !sqlInitializing && !initialSyncing) return null

  const dbDone = pgliteDb && !sqlInitializing
  const dbActive = !dbDone
  const syncActive = dbDone && initialSyncing
  const syncDone = dbDone && !initialSyncing
  const syncStepClass = syncActive ? styles.stepActive : styles.stepPending

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
          <div
            className={`${styles.step} ${
              dbDone ? styles.stepDone : styles.stepActive
            }`}
          >
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepLabel}>
              {formatMessage({
                id: 'initDbStepLabel',
                defaultMessage: 'Initialisiere Datenbank',
              })}
            </span>
            {dbActive && (
              <svg
                className={styles.spinner}
                width="16"
                height="16"
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
            )}
            {dbDone && (
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
            )}
          </div>
          <div className={`${styles.step} ${syncStepClass}`}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepLabel}>
              {formatMessage({
                id: 'syncServerStepLabel',
                defaultMessage: 'Synchronisiere mit dem Server',
              })}
            </span>
            {syncActive && (
              <svg
                className={styles.spinner}
                width="16"
                height="16"
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
            )}
            {syncDone && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
