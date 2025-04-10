import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/crs',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useProjectCrssNavData',
  }),
})
