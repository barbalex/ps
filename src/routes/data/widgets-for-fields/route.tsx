import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { getSession } from '../../../modules/authClient.ts'

const APP_ADMIN_EMAILS = new Set([
  'alex@gabriel-software.ch',
  'alex.barbalex@gmail.com',
])

export const Route = createFileRoute('/data/widgets-for-fields')({
  component: Outlet,
  beforeLoad: async () => {
    const result = await getSession({ query: { disableCookieCache: true } })
    const session =
      result && typeof result === 'object' && 'data' in result
        ? (result as { data?: { user?: { email?: string } } | null }).data
        : (result as { user?: { email?: string } } | null)

    const email = session?.user?.email?.trim().toLowerCase()
    if (!email || !APP_ADMIN_EMAILS.has(email)) {
      throw redirect({ to: '/data' })
    }

    return {
      navDataFetcher: 'useWidgetsForFieldsNavData',
    }
  },
})
