import { createFileRoute } from '@tanstack/react-router'

import { WmsLayer } from '../../../../../formsAndLists/wmsLayer/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-layers/$wmsLayerId',
)({
  component: WmsLayer,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.wmsLayerId || params.wmsLayerId === 'undefined') {
      throw new Error('Invalid or missing wmsLayerId in route parameters')
    }
    return {
      navDataFetcher: 'useWmsLayerNavData',
    }
  },
})
