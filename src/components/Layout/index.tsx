import { useEffect } from 'react'

import { Breadcrumbs } from './Breadcrumbs'
import { Navs } from './Navs'
import { useElectric } from '../../ElectricProvider'
import { Header } from './Header'
import { Main } from './Main'
import { Notifier } from '../Notifier'

export const Layout = () => {
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

  return (
    <>
      <Header />
      <Breadcrumbs />
      <Navs />
      <Main />
      <Notifier />
    </>
  )
}
