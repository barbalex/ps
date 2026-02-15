import { createFileRoute } from '@tanstack/react-router'

import { GoalReport } from '../../../../../../../../../../formsAndLists/goalReport/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/report',
)({
  component: RouteComponent,
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
    return {
    navDataFetcher: 'useGoalReportReportNavData',
  }
  },
})

function RouteComponent() {
  return (
    <GoalReport from="/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/report" />
  )
}
