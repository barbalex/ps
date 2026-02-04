import { createFileRoute } from '@tanstack/react-router'

import { WmsServiceLayer } from '../../../../../../../formsAndLists/wmsServiceLayer/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-services/$wmsServiceId_/layers/$wmsServiceLayerId/',
)({
  component: WmsServiceLayer,
  beforeLoad: () => ({
    navDataFetcher: 'useWmsServiceLayerNavData',
  }),
})
