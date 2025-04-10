import { createFileRoute } from '@tanstack/react-router'

import { GoalReportValues } from '../../../../../../../../../../../formsAndLists/goalReportValues.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/values/',
)({
  component: GoalReportValues,
  notFoundComponent: NotFound,
})
