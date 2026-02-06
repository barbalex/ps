import { useAtomValue } from 'jotai'

import { sqlInitializingAtom } from '../store.ts'

// memoizing this component creates error
export const Initiating = () => {
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
      {sqlInitializing ? 'Initializing database...' : 'Syncing with server...'}
    </div>
  )
}
