import { createRef, useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'

import { createPostgrestClient } from '../../modules/createPostgrestClient.ts'
import { UploaderContext } from '../../UploaderContext.ts'

import { Main } from './Main.tsx'
import { Breadcrumbs } from './Breadcrumbs/index.tsx'
import { Notifications } from '../Notifications/index.tsx'
import { BackgroundTasks } from '../BackgroundTasks/index.tsx'
import { Header } from './Header/index.tsx'
import { EmailVerificationBanner } from '../EmailVerificationBanner.tsx'
import { TableLayersProvider } from '../TableLayersProvider.tsx'
import { OwnVectorLayerPropertiesProvider } from '../Map/OwnVectorLayerPropertiesProvider.tsx'
import { ObservationAssignChooser } from '../ObservationAssignChooser/index.tsx'
import { ChooseAccountForProject } from '../ChooseAccountForProject/index.tsx'
import { ConfirmDeleteAccount } from '../ConfirmDeleteAccount/index.tsx'
import { IsDesktopViewSetter } from '../shared/IsDesktopViewSetter.tsx'
import { ApiDetector } from '../ApiDetector.tsx'
import { AppAdminDetector } from '../AppAdminDetector.tsx'
import { TreeOpenNodesSetter } from '../TreeOpenNodesSetter.tsx'
import { OperationsObserver } from '../OperationsObserver.tsx'
import { AutoFetchCapabilities } from '../AutoFetchCapabilities.tsx'
import { mapMaximizedAtom } from '../../store.ts'

const from = '/data'
const tanstackQueryClient = new QueryClient()

// memoizing this component creates error
export const LayoutProtected = () => {
  const uploaderRef = createRef<HTMLElement | null>(null)
  const mapIsMaximized = useAtomValue(mapMaximizedAtom)

  useEffect(() => {
    createPostgrestClient()
  }, [])

  // onlyForm is a query parameter that allows the user to view a form without the rest of the app
  // used for popups inside the map
  const { onlyForm } = useSearch({ from })

  // Breadcrumbs are not protected because:
  // - they are not (very) sensitive
  // - ui remains more consistent when logging in
  return (
    <QueryClientProvider client={tanstackQueryClient}>
      <UploaderContext.Provider value={uploaderRef}>
        <uc-config
          ctx-name="uploadcare-uploader"
          pubkey="db67c21b6d9964e195b8"
          maxLocalFileSizeBytes="100000000"
          multiple="false"
          sourceList="local, camera, dropbox, gdrive, gphotos"
          useCloudImageEditor="true"
        ></uc-config>
        <uc-upload-ctx-provider
          id="uploaderctx"
          ctx-name="uploadcare-uploader"
          ref={uploaderRef}
        ></uc-upload-ctx-provider>
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
        <ChooseAccountForProject />
        <ConfirmDeleteAccount />
        <IsDesktopViewSetter />
        <ApiDetector />
        <AppAdminDetector />
        <TreeOpenNodesSetter />
        <AutoFetchCapabilities />
        <OperationsObserver />
        <Main />
        <BackgroundTasks />
      </UploaderContext.Provider>
    </QueryClientProvider>
  )
}
