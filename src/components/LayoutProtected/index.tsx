import { useSearchParams } from 'react-router-dom'

import { Main } from './Main'
import { Breadcrumbs } from './Breadcrumbs'
import { Navs } from './Navs'
import { Notifications } from '../Notifications'
import { ProtectedRoute } from '../ProtectedRoute'
import { Header } from './Header'

export const Layout = () => {
  const [searchParams] = useSearchParams()
  const onlyForm = searchParams.get('onlyForm')

  console.log('hello Protected Layout')

  return (
    <>
      <Header />
      {onlyForm !== true && (
        <>
          <Breadcrumbs />
          <Navs />
          <Notifications />
        </>
      )}
      <ProtectedRoute>
        <Main />
      </ProtectedRoute>
    </>
  )
}
