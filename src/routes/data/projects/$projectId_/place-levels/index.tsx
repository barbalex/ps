import { createFileRoute } from '@tanstack/react-router'

import { PlaceLevels } from '../../../../../formsAndLists/placeLevels.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/place-levels/',
)({
  component: PlaceLevels,
  notFoundComponent: NotFound,
})
