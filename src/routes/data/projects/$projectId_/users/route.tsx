import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/users',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useProjectUsersNavData',
  }),
})
