import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/_authLayout/users')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useUsersNavData',
  }),
})
