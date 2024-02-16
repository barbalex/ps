import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Breadcrumbs } from './Breadcrumbs'
import { Navs } from './Navs'
import { useElectric } from '../../ElectricProvider'
import { Header } from './Header'
import { Main } from './Main'
import { Notifications } from '../Notifications'

export const Layout = () => {
  const [searchParams] = useSearchParams()
  const onlyForm = searchParams.get('onlyForm')

  const { db } = useElectric()!
  useEffect(() => {
    const syncItems = async () => {
      // Resolves when the shape subscription has been established.
      const usersSync = await db.users.sync({
        // project_users: not possible as emails...
        include: { accounts: true },
      })

      // Resolves when the data has been synced into the local database.
      await usersSync.synced
    }

    syncItems()
  }, [db.users])

  // console.log('Layout rendering')

  // this is used to show forms inside popups in the map
  if (onlyForm) {
    return <Main />
  }

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
