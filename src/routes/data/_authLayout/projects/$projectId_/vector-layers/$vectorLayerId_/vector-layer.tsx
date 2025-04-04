import { createFileRoute } from '@tanstack/react-router'

import { VectorLayer } from '../../../../../../../formsAndLists/vectorLayer/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/vector-layers/$vectorLayerId_/vector-layer',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <VectorLayer from="/data/_authLayout/projects/$projectId_/vector-layers/$vectorLayerId_/vector-layer" />
  )
}
