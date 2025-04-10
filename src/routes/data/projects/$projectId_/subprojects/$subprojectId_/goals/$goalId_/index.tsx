import { createFileRoute } from '@tanstack/react-router'

import { GoalList } from '../../../../../../../../formsAndLists/goal/List.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <GoalList from="/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/" />
  )
}
