import { createFileRoute } from '@tanstack/react-router'

import { GoalList } from '../../../../../../../../formsAndLists/goal/List.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <GoalList from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId/" />
  )
}
