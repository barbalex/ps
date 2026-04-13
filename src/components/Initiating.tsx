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
            <span className={styles.stepNumber}>1</span>
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
          </div>
        </div>
      </div>
    </div>
  )
}
