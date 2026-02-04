import { createFileRoute } from '@tanstack/react-router'

import { WmsService } from '../../../../../../formsAndLists/wmsService/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-services/$wmsServiceId_/wms-service',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useWmsServiceWmsServiceNavData',
  }),
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
