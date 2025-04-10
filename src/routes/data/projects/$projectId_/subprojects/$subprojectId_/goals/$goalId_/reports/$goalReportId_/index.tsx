import { createFileRoute } from '@tanstack/react-router'

import { GoalReportList } from '../../../../../../../../../../formsAndLists/goalReport/List.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/',
)({
  component: RouteComponent,
})

const RouteComponent = () => {
  return (
    <GoalReportList from="/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/" />
  )
}
