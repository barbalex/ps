import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

import { Header } from '../components/Header'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { Navs } from '../components/Navs'
import { useElectric } from '../ElectricProvider'

export const Root = () => {
  const { db } = useElectric()!
  useEffect(() => {
    const syncItems = async () => {
      // Resolves when the shape subscription has been established.
      const usersSync = await db.users.sync({
        // project_ussers: not possible as emails...
        include: { accounts: true },
      })

      // Resolves when the data has been synced into the local database.
      await usersSync.synced
    }

    syncItems()
  }, [])

  return (
    <>
      <Header />
      <Breadcrumbs />
      <Navs />
      <div className="content">
        <Outlet />
      </div>
    </>
  )
}
