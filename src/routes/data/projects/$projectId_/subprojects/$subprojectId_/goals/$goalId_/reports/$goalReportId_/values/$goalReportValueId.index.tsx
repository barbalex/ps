import { createFileRoute } from '@tanstack/react-router'

import { GoalReportValue } from '../../../../../../../../../../../formsAndLists/goalReportValue/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/values/$goalReportValueId/',
)({
  component: GoalReportValue,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (!params.goalId || params.goalId === 'undefined') {
      throw new Error('Invalid or missing goalId in route parameters')
    }
    if (!params.goalReportId || params.goalReportId === 'undefined') {
      throw new Error('Invalid or missing goalReportId in route parameters')
    }
    if (!params.goalReportValueId || params.goalReportValueId === 'undefined') {
      throw new Error('Invalid or missing goalReportValueId in route parameters')
    }
    return {
    navDataFetcher: 'useGoalReportValueNavData',
  }
  },
})
