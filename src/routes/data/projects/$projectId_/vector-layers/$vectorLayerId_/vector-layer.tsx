import { createFileRoute } from '@tanstack/react-router'

import { VectorLayer } from '../../../../../../formsAndLists/vectorLayer/index.tsx'
const from =
  '/data/projects/$projectId_/vector-layers/$vectorLayerId_/vector-layer'

export const Route = createFileRoute(from)({
  component: () => (
    <VectorLayer from="/data/projects/$projectId_/vector-layers/$vectorLayerId_/vector-layer" />
  ),
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.vectorLayerId || params.vectorLayerId === 'undefined') {
      throw new Error('Invalid or missing vectorLayerId in route parameters')
    }
    return {
      navDataFetcher: 'useVectorLayerVectorLayerNavData',
    }
  },
})
