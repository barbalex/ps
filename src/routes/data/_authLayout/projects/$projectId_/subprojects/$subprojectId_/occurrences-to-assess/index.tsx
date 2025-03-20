import { createFileRoute } from '@tanstack/react-router'

import { Occurrences } from '../../../../../../../../formsAndLists/occurrences.tsx'
import { NotFound } from '../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/occurrences-to-assess/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <Occurrences
      isToAssess={true}
      from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/occurrences-to-assess/"
    />
  )
}
