import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/users/$userId_/accounts')({
  component: Outlet,
  beforeLoad: ({ params }) => {
    if (!params.userId || params.userId === 'undefined') {
      throw new Error('Invalid or missing userId in route parameters')
    }
    return {
      navDataFetcher: 'useAccountsNavData',
    }
  },
})
