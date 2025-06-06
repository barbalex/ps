import { createFileRoute } from '@tanstack/react-router'

import { PlaceUser } from '../../../../../../../../../../../../formsAndLists/placeUser/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/users/$placeUserId_/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PlaceUser from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/users/$placeUserId_/" />
  )
}
