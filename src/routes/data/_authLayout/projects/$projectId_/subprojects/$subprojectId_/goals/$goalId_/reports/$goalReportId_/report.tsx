import { createFileRoute } from '@tanstack/react-router'

import { GoalReport } from '../../../../../../../../../../../formsAndLists/goalReport/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/report',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <GoalReport from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/report" />
  )
}
