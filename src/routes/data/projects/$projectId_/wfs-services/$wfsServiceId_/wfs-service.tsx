import { createFileRoute } from '@tanstack/react-router'

import { WfsService } from '../../../../../../formsAndLists/wfsService/index.tsx'
import { NotFound } from '../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/wfs-service'

export const Route = createFileRoute(from)({
  component: () => (
    <WfsService
      from={
        '/data/projects/$projectId_/wfs-services/$wfsServiceId_/wfs-service'
      }
    />
  ),
  notFoundComponent: NotFound,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.wfsServiceId || params.wfsServiceId === 'undefined') {
      throw new Error('Invalid or missing wfsServiceId in route parameters')
    }
    return {
      navDataFetcher: 'useWfsServiceWfsServiceNavData',
    }
  },
})
