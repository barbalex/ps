import { createFileRoute } from '@tanstack/react-router'

import { GoalReportList } from '../../../../../../../../../../formsAndLists/goalReport/List.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <GoalReportList from="/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/" />
  ),
})
