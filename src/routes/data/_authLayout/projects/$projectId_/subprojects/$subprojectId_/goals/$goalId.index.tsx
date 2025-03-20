import { createFileRoute } from '@tanstack/react-router'

import { Goal } from '../../../../../../../../formsAndLists/goal/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Goal from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId/" />
  )
}
