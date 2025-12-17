import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/queued-operations')({
  component: Outlet,
  // beforeLoad: () => ({
  //   navDataFetcher: 'useAccountsNavData',
  // }),
})
