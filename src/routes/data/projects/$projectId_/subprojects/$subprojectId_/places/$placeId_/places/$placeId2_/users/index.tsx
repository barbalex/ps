import { createFileRoute } from '@tanstack/react-router'

import { PlaceUsers } from '../../../../../../../../../../../formsAndLists/placeUsers.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/users/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <PlaceUsers from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/users/" />
  )
}
