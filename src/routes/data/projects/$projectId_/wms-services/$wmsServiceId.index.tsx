import { createFileRoute } from '@tanstack/react-router'

import { WmsService } from '../../../../../formsAndLists/wmsService/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-services/$wmsServiceId/',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useWmsServiceNavData',
  }),
})

function RouteComponent() {
  return (
    <WmsService
      from={'/data/projects/$projectId_/wms-services/$wmsServiceId/'}
    />
  )
}
