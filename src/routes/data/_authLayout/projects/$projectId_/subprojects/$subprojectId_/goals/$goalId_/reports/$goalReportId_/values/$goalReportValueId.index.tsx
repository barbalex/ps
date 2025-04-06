import { createFileRoute } from '@tanstack/react-router'

import { GoalReportValue } from '../../../../../../../../../../../../formsAndLists/goalReportValue/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/values/$goalReportValueId/',
)({
  component: GoalReportValue,
  beforeLoad: () => ({
    navDataFetcher: 'useGoalReportValueNavData',
  }),
})
