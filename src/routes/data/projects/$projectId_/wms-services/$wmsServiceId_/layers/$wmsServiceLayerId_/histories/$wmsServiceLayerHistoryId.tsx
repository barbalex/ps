import { createFileRoute } from '@tanstack/react-router'

import { WmsServiceLayerHistoryCompare } from '../../../../../../../../../formsAndLists/wmsServiceLayer/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/wms-services/$wmsServiceId_/layers/$wmsServiceLayerId_/histories/$wmsServiceLayerHistoryId'

export const Route = createFileRoute(from)({
  component: WmsServiceLayerHistoryCompare,
})
