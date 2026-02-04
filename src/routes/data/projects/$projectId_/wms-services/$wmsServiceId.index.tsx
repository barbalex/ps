import { createFileRoute } from '@tanstack/react-router'

import { WmsService } from '../../../../../formsAndLists/wmsService/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-services/$wmsServiceId/',
)({
  component: WmsService,
  beforeLoad: () => ({
    navDataFetcher: 'useWmsServiceNavData',
  }),
})
