import { createFileRoute } from '@tanstack/react-router'

import { Goal } from '../../../../../../../../formsAndLists/goal/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/goal',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useGoalGoalNavData',
  }),
})

function RouteComponent() {
  return (
    <Goal from="/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/goal" />
  )
}
