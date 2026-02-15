import { createFileRoute } from '@tanstack/react-router'

import { WfsServiceLayer } from '../../../../../../../formsAndLists/wfsServiceLayer/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/layers/$wfsServiceLayerId/',
)({
  component: WfsServiceLayer,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.wfsServiceId_ || params.wfsServiceId_ === 'undefined') {
      throw new Error('Invalid or missing wfsServiceId_ in route parameters')
    }
    if (!params.wfsServiceLayerId || params.wfsServiceLayerId === 'undefined') {
      throw new Error('Invalid or missing wfsServiceLayerId in route parameters')
    }
    return {
    navDataFetcher: 'useWfsServiceLayerNavData',
  }
  },
})
