import { createFileRoute } from '@tanstack/react-router'

import { Occurrences } from '../../../../../../../../formsAndLists/occurrences.tsx'
import { NotFound } from '../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/occurrences-not-to-assign/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <Occurrences
      isNotToAssign={true}
      from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/occurrences-not-to-assign/"
    />
  )
}
