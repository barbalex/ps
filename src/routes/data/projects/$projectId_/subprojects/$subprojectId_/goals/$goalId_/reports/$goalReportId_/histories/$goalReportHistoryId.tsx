import { createFileRoute } from '@tanstack/react-router'

import { GoalReportHistoryCompare } from '../../../../../../../../../../../formsAndLists/goalReport/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/histories/$goalReportHistoryId')({
  component: GoalReportHistoryCompare,
})
