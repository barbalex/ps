import { createFileRoute } from '@tanstack/react-router'

import { WfsService } from '../../../../../../formsAndLists/wfsService/index.tsx'
import { NotFound } from '../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/wfs-service',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
  beforeLoad: () => ({
    navDataFetcher: 'useWfsServiceWfsServiceNavData',
  }),
})

function RouteComponent() {
  return (
    <WfsService
      from={
        '/data/projects/$projectId_/wfs-services/$wfsServiceId_/wfs-service'
      }
    />
  )
}
