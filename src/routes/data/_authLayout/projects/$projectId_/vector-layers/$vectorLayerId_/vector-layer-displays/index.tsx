import { createFileRoute } from '@tanstack/react-router'

import { VectorLayerDisplays } from '../../../../../../../formsAndLists/vectorLayerDisplays.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/vector-layers/$vectorLayerId_/vector-layer-displays/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <VectorLayerDisplays from="/data/_authLayout/projects/$projectId_/vector-layers/$vectorLayerId_/vector-layer-displays/" />
  )
}
