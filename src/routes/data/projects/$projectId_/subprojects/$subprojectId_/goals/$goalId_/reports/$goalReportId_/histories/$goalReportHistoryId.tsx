import { createFileRoute } from '@tanstack/react-router'

import { GoalReportHistoryCompare } from '../../../../../../../../../../../formsAndLists/goalReport/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/histories/$goalReportHistoryId'

export const Route = createFileRoute(from)({
  component: GoalReportHistoryCompare,
})
