import { useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'

import {
  initialSyncingAtom,
  isLoggingOutAtom,
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
  const isLoggingOut = useAtomValue(isLoggingOutAtom)
  const sqlInitializing = forceSqlInitializing || sqlInitializingAtomValue

  // Keep the loading UI visible until both local DB initialization and
  // initial server sync are complete.
  if (isLoggingOut) return null
  if (pgliteDb && !sqlInitializing && !initialSyncing) return null

  const dbDone = pgliteDb && !sqlInitializing
  const syncActive = dbDone && initialSyncing
  const syncStepClass = syncActive ? styles.stepActive : styles.stepPending

  const title = sqlInitializing
    ? formatMessage({
        id: 'initDbMsg',
        defaultMessage: 'Initialisiere Datenbank',
      })
    : formatMessage({
        id: 'syncServerMsg',
        defaultMessage: 'Synchronisiere mit Server',
      })

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <p className={styles.title}>{title}</p>
        <div className={styles.steps}>
          <div
            className={`${styles.step} ${
              dbDone ? styles.stepDone : styles.stepActive
            }`}
          >
            {dbDone ? (
              <svg
                className={styles.stepNumber}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="12"
                  fill="#287e4a"
                />
                <path
                  d="M7 12.5l3.5 3.5 6-7"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <span className={styles.stepNumber}>1</span>
            )}
            <span className={styles.stepLabel}>
              {formatMessage({
                id: 'initDbStepLabel',
                defaultMessage: 'Datenbank initialisieren',
              })}
            </span>
          </div>
          <div className={`${styles.step} ${syncStepClass}`}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepLabel}>
              {formatMessage({
                id: 'syncServerStepLabel',
                defaultMessage: 'Mit Server synchronisieren',
              })}
            </span>
            {syncActive && (
              <svg
                className={styles.spinner}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
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
          </div>
        </div>
      </div>
    </div>
  )
}
