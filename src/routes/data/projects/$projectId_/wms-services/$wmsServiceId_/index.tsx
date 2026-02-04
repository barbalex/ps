import { createFileRoute } from '@tanstack/react-router'

import { WmsServiceList } from '../../../../../../formsAndLists/wmsService/List.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-services/$wmsServiceId_/',
)({
  component: RouteComponent,
})

const RouteComponent = () => {
  return (
    <WmsServiceList
      from={'/data/projects/$projectId_/wms-services/$wmsServiceId_/'}
    />
  )
}
