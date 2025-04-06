import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useGoalNavData',
  }),
})
