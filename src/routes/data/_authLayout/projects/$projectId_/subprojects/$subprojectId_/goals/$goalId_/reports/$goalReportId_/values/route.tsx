import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/values',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useGoalReportValuesNavData',
  }),
})
