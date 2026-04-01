import { createFileRoute } from '@tanstack/react-router'

import { WfsServiceLayerHistoryCompare } from '../../../../../../../../../formsAndLists/wfsServiceLayer/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/layers/$wfsServiceLayerId_/histories/$wfsServiceLayerHistoryId'

export const Route = createFileRoute(from)({
  component: WfsServiceLayerHistoryCompare,
})
