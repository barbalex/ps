import { createFileRoute } from '@tanstack/react-router'

import { WfsServiceLayer } from '../../../../../../../formsAndLists/wfsServiceLayer/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/layers/$wfsServiceLayerId/',
)({
  component: WfsServiceLayer,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.wfsServiceId || params.wfsServiceId === 'undefined') {
      throw new Error('Invalid or missing wfsServiceId in route parameters')
    }
    if (!params.wfsServiceLayerId || params.wfsServiceLayerId === 'undefined') {
      throw new Error(
        'Invalid or missing wfsServiceLayerId in route parameters',
      )
    }
    return {
      navDataFetcher: 'useWfsServiceLayerNavData',
    }
  },
})
