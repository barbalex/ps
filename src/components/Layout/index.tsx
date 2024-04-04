import { useSearchParams } from 'react-router-dom'

import { Breadcrumbs } from './Breadcrumbs'
import { Navs } from './Navs'
import { Header } from './Header'
import { Main } from './Main'
import { Notifications } from '../Notifications'

export const Layout = () => {
  const [searchParams] = useSearchParams()
  const onlyForm = searchParams.get('onlyForm')

  // console.log('Layout rendering')

  // this is used to show forms inside popups in the map
  if (onlyForm) return <Main />

  return (
    <>
      <Header />
      <Breadcrumbs />
      <Navs />
      <Main />
      <Notifications />
    </>
  )
}
