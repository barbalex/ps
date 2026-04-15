import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { isAppAdminEmail } from '../../../modules/appAdmins.ts'
import { store, userEmailAtom } from '../../../store.ts'

export const Route = createFileRoute('/data/widget-types')({
  component: Outlet,
  beforeLoad: () => {
    const email = store.get(userEmailAtom)

    if (!isAppAdminEmail(email ?? undefined)) {
      throw redirect({ to: '/data' })
    }

    return {
      navDataFetcher: 'useWidgetTypesNavData',
    }
  },
})
