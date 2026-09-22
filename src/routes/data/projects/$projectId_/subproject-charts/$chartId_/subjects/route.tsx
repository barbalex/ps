import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subproject-charts/$chartId_/subjects',
)({
  component: Outlet,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.chartId || params.chartId === 'undefined') {
      throw new Error('Invalid or missing chartId in route parameters')
    }
    return {
      navDataFetcher: 'useSubprojectChartSubjectsNavData',
    }
  },
})
