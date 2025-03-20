import { createFileRoute } from '@tanstack/react-router'

import { GoalReportValues } from '../../../../../../../../../../../../formsAndLists/goalReportValues.tsx'
import { NotFound } from '../../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/values/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <div>
      Hello
      "/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/values/"!
    </div>
  )
}
