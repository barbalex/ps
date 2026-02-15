import { createFileRoute } from '@tanstack/react-router'

import { WmsService } from '../../../../../../formsAndLists/wmsService/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-services/$wmsServiceId_/wms-service',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.wmsServiceId_ || params.wmsServiceId_ === 'undefined') {
      throw new Error('Invalid or missing wmsServiceId_ in route parameters')
    }
    return {
    navDataFetcher: 'useWmsServiceWmsServiceNavData',
  }
  },
})

function RouteComponent() {
  return (
    <WmsService
      from={
        '/data/projects/$projectId_/wms-services/$wmsServiceId_/wms-service'
      }
    />
  )
}
