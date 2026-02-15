import { createFileRoute } from '@tanstack/react-router'

import { WfsService } from '../../../../../../formsAndLists/wfsService/index.tsx'
import { NotFound } from '../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/wfs-service',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.wfsServiceId_ || params.wfsServiceId_ === 'undefined') {
      throw new Error('Invalid or missing wfsServiceId_ in route parameters')
    }
    return {
    navDataFetcher: 'useWfsServiceWfsServiceNavData',
  }
  },
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
