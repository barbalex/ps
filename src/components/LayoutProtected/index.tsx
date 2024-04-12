import { memo } from 'react'
// import { useSearchParams } from 'react-router-dom'

import { Main } from './Main'
import { Breadcrumbs } from './Breadcrumbs'
import { Navs } from './Navs'
import { Notifications } from '../Notifications'
import { ProtectedRoute } from '../ProtectedRoute'
import { Header } from './Header'

// memoizing this component creates error
export const Layout = memo(() => {
  // onlyForm is a query parameter that allows the user to view a form without the rest of the app
  // used for popups inside the map
  // TODO: this renders on every navigation!!! This temporarily disabled
  // because of the searchParams? JES
  // seems not solvable with react-router: https://github.com/remix-run/react-router/discussions/9851
  // there is this pull request: https://github.com/remix-run/react-router/pull/10740
  // const [searchParams] = useSearchParams()
  // const onlyForm = searchParams.get('onlyForm')
  const onlyForm = false

  console.log('hello Protected Layout')

  // Breadcrumbs and Navs are not protected because:
  // - they are not (very) sensitive
  // - ui remains more consistent when logging in
  return (
    <>
      {onlyForm !== true && (
        <>
          <Header />
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
})
