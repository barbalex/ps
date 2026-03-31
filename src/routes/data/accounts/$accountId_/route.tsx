import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/accounts/$accountId_')({
  component: Outlet,
  beforeLoad: ({ params }) => {
    if (!params.accountId || params.accountId === 'undefined') {
      throw new Error('Invalid or missing accountId in route parameters')
    }
    return {
      navDataFetcher: 'useAccountNavData',
    }
  },
})
