import { useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'

import { sqlInitializingAtom } from '../store.ts'
import styles from './Initiating.module.css'

// memoizing this component creates error
export const Initiating = () => {
  const { formatMessage } = useIntl()
  const sqlInitializing = useAtomValue(sqlInitializingAtom)

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
