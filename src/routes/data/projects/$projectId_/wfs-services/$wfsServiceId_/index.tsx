import { createFileRoute } from '@tanstack/react-router'

import { WfsServiceList } from '../../../../../../formsAndLists/wfsService/List.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/',
)({
  component: RouteComponent,
})

const RouteComponent = () => {
  return (
    <WfsServiceList
      from={'/data/projects/$projectId_/wfs-services/$wfsServiceId_/'}
    />
  )
}
