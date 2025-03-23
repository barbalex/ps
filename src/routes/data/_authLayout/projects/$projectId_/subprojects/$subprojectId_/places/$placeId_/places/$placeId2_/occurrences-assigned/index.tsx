import { createFileRoute } from '@tanstack/react-router'

import { Occurrences } from '../../../../../../../../../../../formsAndLists/occurrences.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/occurrences-assigned/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <Occurrences
      isAssigned={true}
      from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/occurrences-assigned/"
    />
  )
}
