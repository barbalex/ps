import { useSearchParams, useLocation, Outlet } from 'react-router-dom'

import { Breadcrumbs } from './Breadcrumbs'
import { Navs } from './Navs'
import { Header } from './Header'
import { Main } from './Main'
import { Notifications } from '../Notifications'
import { ProtectedRoute } from '../ProtectedRoute'

const homeOutletStyle = {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  overflow: 'hidden',
  position: 'relative',
}

export const Layout = () => {
  const [searchParams] = useSearchParams()
  const onlyForm = searchParams.get('onlyForm')

  const { pathname } = useLocation()
  const isHome = pathname === '/'

  // this is used to show forms inside popups in the map
  if (onlyForm) return <Main />

  // TODO: not logged in visitors
  // should see only simplified header and home page
  if (isHome) {
    return (
      <>
        <Header />
        <div style={homeOutletStyle}>
          <Outlet />
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <Breadcrumbs />
      <Navs />
      <ProtectedRoute>
        <Main />
      </ProtectedRoute>
      <Notifications />
    </>
  )
}
