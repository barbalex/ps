import { createFileRoute } from '@tanstack/react-router'

import { SubprojectList } from '../../../../../../formsAndLists/subproject/List.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SubprojectList from="/data/projects/$projectId_/subprojects/$subprojectId_/" />
  )
}
