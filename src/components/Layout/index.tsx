import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

import { Breadcrumbs } from './Breadcrumbs'
import { Navs } from './Navs'
import { useElectric } from '../../ElectricProvider'
import { Header } from './Header'

const outletContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  overflow: 'hidden',
}

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
      <div style={outletContainerStyle}>
        <Outlet />
      </div>
    </>
  )
}
