import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

import { Breadcrumbs } from './Breadcrumbs'
import { Navs } from './Navs'
import { useElectric } from '../ElectricProvider'

export const Header = () => {
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
  }, [db.users])

  // console.log('Header')
  // set true to show single line of breadcrumbs
  const overflowing = true

  return (
    <>
      <div className="header">
        <h1>Promoting Species</h1>
      </div>
      <Breadcrumbs overflowing={overflowing} />
      <Navs />
      <div className="content">
        <Outlet />
      </div>
    </>
  )
}
