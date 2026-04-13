import { useAtomValue } from 'jotai'
import { useSearch } from '@tanstack/react-router'

import { Main } from './Main.tsx'
import { Breadcrumbs } from './Breadcrumbs/index.tsx'
import { Notifications } from '../Notifications/index.tsx'
import { BackgroundTasks } from '../BackgroundTasks/index.tsx'
import { Header } from './Header/index.tsx'
import { EmailVerificationBanner } from '../EmailVerificationBanner.tsx'
import { TableLayersProvider } from '../TableLayersProvider.tsx'
import { OwnVectorLayerPropertiesProvider } from '../Map/OwnVectorLayerPropertiesProvider.tsx'
import { ObservationAssignChooser } from '../ObservationAssignChooser/index.tsx'
import { IsDesktopViewSetter } from '../shared/IsDesktopViewSetter.tsx'
import { ApiDetector } from '../ApiDetector.tsx'
import { AppAdminDetector } from '../AppAdminDetector.tsx'
import { TreeOpenNodesSetter } from '../TreeOpenNodesSetter.tsx'
import { OperationsObserver } from '../OperationsObserver.tsx'
import { AutoFetchCapabilities } from '../AutoFetchCapabilities.tsx'
import { mapMaximizedAtom } from '../../store.ts'

const from = '/data'

// memoizing this component creates error
export const LayoutProtected = () => {
  const mapIsMaximized = useAtomValue(mapMaximizedAtom)

  // onlyForm is a query parameter that allows the user to view a form without the rest of the app
  // used for popups inside the map
  const { onlyForm } = useSearch({ from })

  // Breadcrumbs are not protected because:
  // - they are not (very) sensitive
  // - ui remains more consistent when logging in
  return (
    <>
      {onlyForm !== true && (
        <>
          <Header />
          <EmailVerificationBanner />
          {!mapIsMaximized && <Breadcrumbs />}
          <Notifications />
        </>
      )}
      <TableLayersProvider />
      <OwnVectorLayerPropertiesProvider />
      <ObservationAssignChooser />
      <IsDesktopViewSetter />
      <ApiDetector />
      <AppAdminDetector />
      <TreeOpenNodesSetter />
      <AutoFetchCapabilities />
      <OperationsObserver />
      <Main />
      <BackgroundTasks />
    </>
  )
}
