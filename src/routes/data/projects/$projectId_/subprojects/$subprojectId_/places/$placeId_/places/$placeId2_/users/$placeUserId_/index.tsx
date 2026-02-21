import { createFileRoute } from '@tanstack/react-router'

import { PlaceUser } from '../../../../../../../../../../../../formsAndLists/placeUser/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/users/$placeUserId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceUser from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/users/$placeUserId_/" />
  ),
})
