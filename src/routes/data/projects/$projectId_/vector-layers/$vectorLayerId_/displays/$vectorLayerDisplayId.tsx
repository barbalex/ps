import { createFileRoute } from '@tanstack/react-router'

import { VectorLayerDisplay } from '../../../../../../../formsAndLists/vectorLayerDisplay/index.tsx'
const from =
  '/data/projects/$projectId_/vector-layers/$vectorLayerId_/displays/$vectorLayerDisplayId'

export const Route = createFileRoute(from)({
  component: () => (
    <VectorLayerDisplay from="/data/projects/$projectId_/vector-layers/$vectorLayerId_/displays/$vectorLayerDisplayId" />
  ),
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.vectorLayerId || params.vectorLayerId === 'undefined') {
      throw new Error('Invalid or missing vectorLayerId in route parameters')
    }
    if (
      !params.vectorLayerDisplayId ||
      params.vectorLayerDisplayId === 'undefined'
    ) {
      throw new Error(
        'Invalid or missing vectorLayerDisplayId in route parameters',
      )
    }
    return {
      navDataFetcher: 'useVectorLayerDisplayNavData',
    }
  },
})
