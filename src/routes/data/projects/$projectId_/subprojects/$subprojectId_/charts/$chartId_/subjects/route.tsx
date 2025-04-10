import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/subjects',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useChartSubjectsNavData',
  }),
})
