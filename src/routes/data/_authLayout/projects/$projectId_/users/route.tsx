import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/users',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useProjectUsersNavData',
  }),
})
