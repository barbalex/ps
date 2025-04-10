import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useGoalReportNavData',
  }),
})
