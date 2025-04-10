import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/users')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useUsersNavData',
  }),
})
