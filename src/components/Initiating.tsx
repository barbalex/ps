import { useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'

import { pgliteDbAtom, sqlInitializingAtom } from '../store.ts'
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
  const sqlInitializing = forceSqlInitializing || sqlInitializingAtomValue

  // If database is already initialized, don't show initializing message
  if (pgliteDb) return null

  return (
    <div className={styles.container}>
      {sqlInitializing
        ? formatMessage({
            id: 'initDbMsg',
            defaultMessage: 'Initialisiere Datenbank',
          })
        : formatMessage({
            id: 'syncServerMsg',
            defaultMessage: 'Synchronisiere mit Server',
          })}
    </div>
  )
}
