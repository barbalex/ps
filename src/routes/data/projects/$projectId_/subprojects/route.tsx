import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useSubprojectsNavData',
  }),
})
