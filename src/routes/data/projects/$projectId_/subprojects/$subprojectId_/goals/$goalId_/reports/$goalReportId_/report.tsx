import { createFileRoute } from '@tanstack/react-router'

import { GoalReport } from '../../../../../../../../../../formsAndLists/goalReport/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/report',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useGoalReportReportNavData',
  }),
})

function RouteComponent() {
  return (
    <GoalReport from="/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/report" />
  )
}
