import { createFileRoute } from '@tanstack/react-router'

import { WmsServiceLayers } from '../../../../../../formsAndLists/wmsServiceLayers.tsx'
import { NotFound } from '../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-services/$wmsServiceId_/layers/',
)({
  component: WmsServiceLayers,
  notFoundComponent: NotFound,
})
