import { createFileRoute } from '@tanstack/react-router'

import { GoalReport } from '../../../../../../../../../../formsAndLists/goalReport/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/report',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.subprojectId_ || params.subprojectId_ === 'undefined') {
      throw new Error('Invalid or missing subprojectId_ in route parameters')
    }
    if (!params.goalId_ || params.goalId_ === 'undefined') {
      throw new Error('Invalid or missing goalId_ in route parameters')
    }
    if (!params.goalReportId_ || params.goalReportId_ === 'undefined') {
      throw new Error('Invalid or missing goalReportId_ in route parameters')
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
