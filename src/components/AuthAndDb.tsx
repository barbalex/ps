import { useContext } from 'react'
import { Outlet } from '@tanstack/react-router'
import { CorbadoProvider } from '@corbado/react'
import { useAtomValue } from 'jotai'

import { SqlInitializer } from './SqlInitializer.tsx'
import { InitialSyncManager } from './InitialSyncManager.tsx'
// TODO: sync with db IF user has an account
import { Syncer } from './Syncer.tsx'
import { LayoutProtected } from './LayoutProtected/index.tsx'
import { Initiating } from './Initiating.tsx'
import { initialSyncingAtom, sqlInitializingAtom } from '../store.ts'
import { DialogModeContext } from './QcsResultDialog/DialogModeContext.ts'

const CORBADO_PROJECT_ID = import.meta.env.ELECTRIC_CORBADO_PROJECT_ID

export const AuthAndDb = () => {
  const initialSyncing = useAtomValue(initialSyncingAtom)
  const sqlInitializing = useAtomValue(sqlInitializingAtom)

  // When rendered inside the QcsResultDialog's memory router, skip the full
  // app shell (auth, layout) and just pass through to the route component.
  const isInDialog = useContext(DialogModeContext)
  if (isInDialog) return <Outlet />

  const initiating = sqlInitializing || initialSyncing

  return (
    <CorbadoProvider projectId={CORBADO_PROJECT_ID} theme="corbado-theme">
      <SqlInitializer />
      <InitialSyncManager />
      <Syncer />
      {initiating ? <Initiating /> : <LayoutProtected />}
    </CorbadoProvider>
  )
}
