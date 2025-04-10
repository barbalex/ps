import { createFileRoute } from '@tanstack/react-router'

import { WmsLayers } from '../../../../../formsAndLists/wmsLayers.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-layers/',
)({
  component: WmsLayers,
  notFoundComponent: NotFound,
})
