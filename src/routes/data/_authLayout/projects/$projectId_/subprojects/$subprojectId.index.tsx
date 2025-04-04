import { createFileRoute } from '@tanstack/react-router'

import { SubprojectList } from '../../../../../../formsAndLists/subproject/List.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SubprojectList from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId/" />
  )
}
