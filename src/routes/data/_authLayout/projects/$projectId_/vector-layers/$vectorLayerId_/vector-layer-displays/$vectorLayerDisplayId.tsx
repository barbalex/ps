import { createFileRoute } from '@tanstack/react-router'

import { VectorLayerDisplay } from '../../../../../../../formsAndLists/vectorLayerDisplay/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/vector-layers/$vectorLayerId_/vector-layer-displays/$vectorLayerDisplayId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <VectorLayerDisplay from="/data/_authLayout/projects/$projectId_/vector-layers/$vectorLayerId_/vector-layer-displays/$vectorLayerDisplayId" />
  )
}
