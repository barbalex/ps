import { createFileRoute } from '@tanstack/react-router'
import { PlaceHistories } from '../../../../../../../../../../../formsAndLists/placeHistories.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/histories/',
)({
  component: PlaceHistories,
})
