import { createFileRoute } from '@tanstack/react-router'

import { VectorLayerDisplay } from '../../../../../../../../formsAndLists/vectorLayerDisplay'

const from =
  '/data/projects/$projectId_/vector-layers/$vectorLayerId_/displays/$vectorLayerDisplayId_/vector-layer-display'

export const Route = createFileRoute(from)({
  component: () => <VectorLayerDisplay from={from} />,
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
      navDataFetcher: 'useVectorLayerDisplayVectorLayerDisplayNavData',
    }
  },
})
