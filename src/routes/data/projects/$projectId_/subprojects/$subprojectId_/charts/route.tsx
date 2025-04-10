import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/charts',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useChartsNavData',
  }),
})
