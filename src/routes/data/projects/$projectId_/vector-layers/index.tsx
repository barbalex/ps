import { createFileRoute } from '@tanstack/react-router'

import { VectorLayers } from '../../../../../formsAndLists/vectorLayers.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/vector-layers/',
)({
  component: VectorLayers,
  notFoundComponent: NotFound,
})
