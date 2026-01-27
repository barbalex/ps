import { createFileRoute } from '@tanstack/react-router'

import { VectorLayer } from '../../../../../../formsAndLists/vectorLayer/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/vector-layers/$vectorLayerId_/vector-layer',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useVectorLayerVectorLayerNavData',
  }),
})

function RouteComponent() {
  return (
    <VectorLayer from="/data/projects/$projectId_/vector-layers/$vectorLayerId_/vector-layer" />
  )
}
