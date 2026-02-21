import { createFileRoute } from '@tanstack/react-router'

import { Place } from '../../../../../../../../formsAndLists/place/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/place'

export const Route = createFileRoute(from)({
  component: () => (
    <Place from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/place" />
  ),
})
