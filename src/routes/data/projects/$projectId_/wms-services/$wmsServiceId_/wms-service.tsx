import { createFileRoute } from '@tanstack/react-router'

import { WmsService } from '../../../../../../formsAndLists/wmsService/index.tsx'
const from =
  '/data/projects/$projectId_/wms-services/$wmsServiceId_/wms-service'

export const Route = createFileRoute(from)({
  component: () => (
    <WmsService
      from={
        '/data/projects/$projectId_/wms-services/$wmsServiceId_/wms-service'
      }
    />
  ),
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.wmsServiceId || params.wmsServiceId === 'undefined') {
      throw new Error('Invalid or missing wmsServiceId in route parameters')
    }
    return {
      navDataFetcher: 'useWmsServiceWmsServiceNavData',
    }
  },
})
