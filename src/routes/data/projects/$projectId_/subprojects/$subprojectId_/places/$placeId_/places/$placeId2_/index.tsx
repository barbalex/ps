import { createFileRoute } from '@tanstack/react-router'

import { PlaceList } from '../../../../../../../../../../formsAndLists/place/List.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceList from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/" />
  ),
})
