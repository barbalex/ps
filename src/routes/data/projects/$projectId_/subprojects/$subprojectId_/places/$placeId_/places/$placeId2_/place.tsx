import { createFileRoute } from '@tanstack/react-router'

import { PlaceIndex } from '../../../../../../../../../../formsAndLists/place/Index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/place'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/place" />
  ),
})
