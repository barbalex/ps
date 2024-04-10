import { useSearchParams } from 'react-router-dom'

import { Main } from './Main'
import { Breadcrumbs } from './Breadcrumbs'
import { Navs } from './Navs'
import { Notifications } from '../Notifications'

export const Layout = () => {
  const [searchParams] = useSearchParams()
  const onlyForm = searchParams.get('onlyForm')

  if (onlyForm) return <Main />

  return (
    <>
      <Breadcrumbs />
      <Navs />
      <Main />
      <Notifications />
    </>
  )
}
