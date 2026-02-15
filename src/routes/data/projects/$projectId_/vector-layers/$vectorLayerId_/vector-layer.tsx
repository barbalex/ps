import { createFileRoute } from '@tanstack/react-router'

import { VectorLayer } from '../../../../../../formsAndLists/vectorLayer/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/vector-layers/$vectorLayerId_/vector-layer',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.vectorLayerId_ || params.vectorLayerId_ === 'undefined') {
      throw new Error('Invalid or missing vectorLayerId_ in route parameters')
    }
    return {
    navDataFetcher: 'useVectorLayerVectorLayerNavData',
  }
  },
})

function RouteComponent() {
  return (
    <VectorLayer from="/data/projects/$projectId_/vector-layers/$vectorLayerId_/vector-layer" />
  )
}
