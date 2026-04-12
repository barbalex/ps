import { useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'

import { sqlInitializingAtom } from '../store.ts'
import styles from './Initiating.module.css'

type InitiatingProps = {
  forceSqlInitializing?: boolean
}

// memoizing this component creates error
export const Initiating = ({
  forceSqlInitializing = false,
}: InitiatingProps) => {
  const { formatMessage } = useIntl()
  const sqlInitializingAtomValue = useAtomValue(sqlInitializingAtom)
  const sqlInitializing = forceSqlInitializing || sqlInitializingAtomValue

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
