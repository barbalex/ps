import { createFileRoute } from '@tanstack/react-router'

import { WmsLayer } from '../../../../../formsAndLists/wmsLayer/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-layers/$wmsLayerId',
)({
  component: WmsLayer,
  beforeLoad: () => ({
    navDataFetcher: 'useWmsLayerNavData',
  }),
})
