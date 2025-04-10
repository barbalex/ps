import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/units',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useUnitsNavData',
  }),
})
