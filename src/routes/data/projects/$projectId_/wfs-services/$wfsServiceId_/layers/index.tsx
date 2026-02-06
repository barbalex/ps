import { createFileRoute } from '@tanstack/react-router'

import { WfsServiceLayers } from '../../../../../../../formsAndLists/wfsServiceLayers.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/layers/',
)({
  component: WfsServiceLayers,
  notFoundComponent: NotFound,
})
