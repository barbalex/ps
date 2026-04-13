import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/data/users/$userId_/accounts')({
  component: Outlet,
  beforeLoad: ({ params }) => {
    const userId = params.userId ?? params.userId_
    if (!userId || userId === 'undefined') {
      throw redirect({ to: '/data/users' })
    }
    return {
      navDataFetcher: 'useAccountsNavData',
    }
  },
})
