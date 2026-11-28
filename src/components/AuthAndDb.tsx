import { useContext } from 'react'
import { Outlet } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { useBeforeunload } from '../modules/useBeforeunload.ts'
import { PGliteProvider } from '@electric-sql/pglite-react'
import type { PGliteWithLive } from '@electric-sql/pglite/live'

import { SqlInitializer } from './SqlInitializer.tsx'
import { InitialSyncManager } from './InitialSyncManager.tsx'
import { Syncer } from './Syncer.tsx'
import { BackgroundSyncIndicator } from './BackgroundSyncIndicator.tsx'
import { SyncScopeReconciler } from './SyncScopeReconciler.tsx'
import { InterruptedImportCleanup } from './InterruptedImportCleanup.tsx'
import { LayoutProtected } from './LayoutProtected/index.tsx'
import { FormFieldsProvider } from './shared/FormDesign/FormFieldsProvider.tsx'
import { FormDesignsProvider } from './shared/FormDesign/FormDesignsProvider.tsx'
import { Initiating } from './Initiating.tsx'
import {
  pgliteDbAtom,
  sqlInitializingAtom,
  syncObjectAtom,
  initialSyncingAtom,
} from '../store.ts'
import { DialogModeContext } from './QcsResultDialog/DialogModeContext.ts'

export const AuthAndDb = () => {
  const pgliteDb = useAtomValue(pgliteDbAtom)
  const sqlInitializing = useAtomValue(sqlInitializingAtom)
  const initialSyncing = useAtomValue(initialSyncingAtom)
  const syncObject = useAtomValue(syncObjectAtom) as
    | { unsubscribe?: () => void }
    | null

  // unsubscribe from sync when page unloads
  useBeforeunload(() => {
    syncObject?.unsubscribe?.()
  })

  // To present QC-results we use a dialog with its own memory router.
  // In that case, we don't want to render the full app shell (auth, layout),
  // but just pass through to the route component.
  const isInDialog = useContext(DialogModeContext)
  if (!pgliteDb) return <Initiating />

  return (
    <PGliteProvider db={pgliteDb as unknown as PGliteWithLive}>
      {isInDialog ? (
        <FormFieldsProvider>
          <FormDesignsProvider>
            <Outlet />
          </FormDesignsProvider>
        </FormFieldsProvider>
      ) : (
        <>
          <SqlInitializer />
          <InitialSyncManager />
          <Syncer />
          <BackgroundSyncIndicator />
          <SyncScopeReconciler />
          <InterruptedImportCleanup />
          {sqlInitializing || initialSyncing ? (
            <Initiating />
          ) : (
            <FormFieldsProvider>
              <FormDesignsProvider>
                <LayoutProtected />
              </FormDesignsProvider>
            </FormFieldsProvider>
          )}
        </>
      )}
    </PGliteProvider>
  )
}
