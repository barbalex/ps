import { useAtom } from 'jotai'
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
import { mapMaximizedAtom } from '../../store.ts'

const from = '/data'

// memoizing this component creates error
export const Layout = () => {
  const [mapIsMaximized] = useAtom(mapMaximizedAtom)

  // onlyForm is a query parameter that allows the user to view a form without the rest of the app
  // used for popups inside the map
  const { onlyForm } = useSearch({ from })

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
        <Main />
      </ProtectedRoute>
    </>
  )
}
