import { createFileRoute } from '@tanstack/react-router'

import { WmsServiceLayer } from '../../../../../../../formsAndLists/wmsServiceLayer/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-services/$wmsServiceId_/layers/$wmsServiceLayerId/',
)({
  component: WmsServiceLayer,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.wmsServiceId || params.wmsServiceId === 'undefined') {
      throw new Error('Invalid or missing wmsServiceId in route parameters')
    }
    if (!params.wmsServiceLayerId || params.wmsServiceLayerId === 'undefined') {
      throw new Error('Invalid or missing wmsServiceLayerId in route parameters')
    }
    return {
    navDataFetcher: 'useWmsServiceLayerNavData',
  }
  },
})
