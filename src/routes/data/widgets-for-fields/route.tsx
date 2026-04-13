import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { getSession } from '../../../modules/authClient.ts'
import { isAppAdminEmail } from '../../../modules/appAdmins.ts'

export const Route = createFileRoute('/data/widgets-for-fields')({
  component: Outlet,
  beforeLoad: async () => {
    const result = await getSession({ query: { disableCookieCache: true } })
    const session =
      result && typeof result === 'object' && 'data' in result
        ? (result as { data?: { user?: { email?: string } } | null }).data
        : (result as { user?: { email?: string } } | null)

    if (!isAppAdminEmail(session?.user?.email)) {
      throw redirect({ to: '/data' })
    }

    return {
      navDataFetcher: 'useWidgetsForFieldsNavData',
    }
  },
})
