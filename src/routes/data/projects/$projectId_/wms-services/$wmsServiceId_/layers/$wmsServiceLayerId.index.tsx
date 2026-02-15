import { createFileRoute } from '@tanstack/react-router'

import { WmsServiceLayer } from '../../../../../../../formsAndLists/wmsServiceLayer/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-services/$wmsServiceId_/layers/$wmsServiceLayerId/',
)({
  component: WmsServiceLayer,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.wmsServiceId_ || params.wmsServiceId_ === 'undefined') {
      throw new Error('Invalid or missing wmsServiceId_ in route parameters')
    }
    if (!params.wmsServiceLayerId || params.wmsServiceLayerId === 'undefined') {
      throw new Error('Invalid or missing wmsServiceLayerId in route parameters')
    }
    return {
    navDataFetcher: 'useWmsServiceLayerNavData',
  }
  },
})
