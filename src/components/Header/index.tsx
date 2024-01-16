import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { Breadcrumbs } from './Breadcrumbs/BreadcrumbsWrapping'
import { BreadcrumbsOverflowing } from './Breadcrumbs/BreadcrumbsOverflowing'
import { Navs } from '../Navs'
import { useElectric } from '../../ElectricProvider'
import { TopHeader } from './TopHeader'
import { user_id } from '../SqlInitializer'
import { UiOptions as UiOption } from '../../../generated/client'

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
  // get ui_options.breadcrumbs_overflowing
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )

  const uiOption: UiOption = results

  console.log('Header', { uiOption })

  // set true to show single line of breadcrumbs
  const overflowing = uiOption?.breadcrumbs_overflowing ?? true

  return (
    <>
      <TopHeader />
      {!!uiOption && overflowing ? <BreadcrumbsOverflowing /> : <Breadcrumbs />}
      <Navs />
      <div className="content">
        <Outlet />
      </div>
    </>
  )
}
