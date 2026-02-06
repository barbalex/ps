import { useAtomValue } from 'jotai'
import { useSearch } from '@tanstack/react-router'

import { Main } from './Main.tsx'
import { Breadcrumbs } from './Breadcrumbs/index.tsx'
import { Notifications } from '../Notifications/index.tsx'
import { ProtectedRoute } from '../ProtectedRoute.tsx'
import { Header } from './Header/index.tsx'
import { TableLayersProvider } from '../TableLayersProvider.tsx'
import { OwnVectorLayerPropertiesProvider } from '../Map/OwnVectorLayerPropertiesProvider.tsx'
import { OccurrenceAssignChooser } from '../OccurrenceAssignChooser/index.tsx'
import { IsDesktopViewSetter } from '../shared/IsDesktopViewSetter.tsx'
import { PostgrestClientInitator } from '../PostgrestClientInitator.tsx'
import { ApiDetector } from '../ApiDetector.tsx'
import { TreeOpenNodesSetter } from '../TreeOpenNodesSetter.tsx'
import { OperationsObserver } from '../OperationsObserver.tsx'
import {
  mapMaximizedAtom,
  sqlInitializingAtom,
  initialSyncingAtom,
} from '../../store.ts'

const from = '/data'

// memoizing this component creates error
export const LayoutProtected = () => {
  const mapIsMaximized = useAtomValue(mapMaximizedAtom)
  const sqlInitializing = useAtomValue(sqlInitializingAtom)
  const initialSyncing = useAtomValue(initialSyncingAtom)
  console.log('Layout, initialSyncing:', initialSyncing)

  // onlyForm is a query parameter that allows the user to view a form without the rest of the app
  // used for popups inside the map
  const { onlyForm } = useSearch({ from })

  // Show loading state while initializing or syncing
  // calling components that query data can lead to errors if the database isn't initialized or synced yet, so we block the entire layout until both are done
  if (sqlInitializing || initialSyncing) {
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
        {sqlInitializing ?
          'Initializing database...'
        : 'Syncing with server...'}
      </div>
    )
  }

  // Breadcrumbs are not protected because:
  // - they are not (very) sensitive
  // - ui remains more consistent when logging in
  // TODO: reenable below
  // return <Main />

  // ignore Navs for now
  // TODO: implement nav-lists to replace previous navs
  return (
    <>
      {onlyForm !== true && (
        <>
          <Header />
          {!mapIsMaximized && <Breadcrumbs />}
          <Notifications />
        </>
      )}
      <ProtectedRoute>
        <TableLayersProvider />
        <OwnVectorLayerPropertiesProvider />
        <OccurrenceAssignChooser />
        <IsDesktopViewSetter />
        <PostgrestClientInitator />
        <ApiDetector />
        <TreeOpenNodesSetter />
        <OperationsObserver />
        <Main />
      </ProtectedRoute>
    </>
  )
}
