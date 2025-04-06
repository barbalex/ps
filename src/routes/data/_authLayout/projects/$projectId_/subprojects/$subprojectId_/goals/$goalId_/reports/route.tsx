import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useGoalReportsNavData',
  }),
})
