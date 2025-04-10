import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/reports',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useProjectReportsNavData',
  }),
})
