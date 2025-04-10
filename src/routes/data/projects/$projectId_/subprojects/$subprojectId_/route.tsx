import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useSubprojectNavData',
  }),
})
