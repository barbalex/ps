import { createFileRoute } from '@tanstack/react-router'

import { Subproject } from '../../../../../../formsAndLists/subproject/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/subproject',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Subproject from="/data/projects/$projectId_/subprojects/$subprojectId_/subproject" />
  )
}
