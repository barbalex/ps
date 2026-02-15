import { createFileRoute } from '@tanstack/react-router'

import { Goal } from '../../../../../../../../formsAndLists/goal/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/goal',
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
