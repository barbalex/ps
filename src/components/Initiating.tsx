import { useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'

import { sqlInitializingAtom } from '../store.ts'

// memoizing this component creates error
export const Initiating = () => {
  const { formatMessage } = useIntl()
  const sqlInitializing = useAtomValue(sqlInitializingAtom)

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem',
        color: '#666',
      }}
    >
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
