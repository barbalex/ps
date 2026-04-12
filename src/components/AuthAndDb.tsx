import { useContext } from 'react'
import { Outlet } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { useBeforeunload } from 'react-beforeunload'

import { SqlInitializer } from './SqlInitializer.tsx'
import { InitialSyncManager } from './InitialSyncManager.tsx'
import { Syncer } from './Syncer.tsx'
import { LayoutProtected } from './LayoutProtected/index.tsx'
import { Initiating } from './Initiating.tsx'
import {
  sqlInitializingAtom,
  syncObjectAtom,
  initialSyncingAtom,
} from '../store.ts'
import { DialogModeContext } from './QcsResultDialog/DialogModeContext.ts'

export const AuthAndDb = () => {
  const sqlInitializing = useAtomValue(sqlInitializingAtom)
  const initialSyncing = useAtomValue(initialSyncingAtom)
  const syncObject = useAtomValue(syncObjectAtom)

  // unsubscribe from sync when page unloads
  useBeforeunload(() => {
    syncObject?.unsubscribe?.()
  })

  // To present QC-results we use a dialog with its own memory router.
  // In that case, we don't want to render the full app shell (auth, layout),
  // but just pass through to the route component.
  const isInDialog = useContext(DialogModeContext)
  if (isInDialog) return <Outlet />

  return (
    <>
      <SqlInitializer />
      <InitialSyncManager />
      <Syncer />
      {sqlInitializing || initialSyncing ? <Initiating /> : <LayoutProtected />}
    </>
  )
}
