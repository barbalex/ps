import { createFileRoute } from '@tanstack/react-router'

import { Goal } from '../../../../../../../../formsAndLists/goal/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/goal',
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
    return {
    navDataFetcher: 'useGoalGoalNavData',
  }
  },
})

function RouteComponent() {
  return (
    <Goal from="/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/goal" />
  )
}
