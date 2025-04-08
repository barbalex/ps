import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/_authLayout/accounts')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useAccountsNavData',
  }),
})
