import { createFileRoute } from '@tanstack/react-router'

import { WmsLayer } from '../../../../../../formsAndLists/wmsLayer'
import { NotFound } from '../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-layers/$wmsLayerId_/wms-layer',
)({
  component: WmsLayer,
  notFoundComponent: NotFound,
  beforeLoad: () => {
    return {
      navDataFetcher: 'useWmsLayerWmsLayerNavData',
    }
  },
})
