import { createFileRoute } from '@tanstack/react-router'

import { PlaceIndex } from '../../../../../../../../formsAndLists/place/index.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/place')({
  component: () => (
    <PlaceIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/place" />
  ),
})
