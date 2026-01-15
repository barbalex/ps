import { createFileRoute } from '@tanstack/react-router'

import { PlaceHistories } from '../../../../../../../../../formsAndLists/placeHistories.tsx'
import { NotFound } from '../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/histories/',
)({
  component: PlaceHistories,
  notFoundComponent: NotFound,
})
