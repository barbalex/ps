import { createFileRoute } from '@tanstack/react-router'

import { GoalReports } from '../../../../../../../../../formsAndLists/goalReports.tsx'
import { NotFound } from '../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/',
)({
  component: GoalReports,
  notFoundComponent: NotFound,
})
