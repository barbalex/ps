import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useSubprojectsNavData',
  }),
})
