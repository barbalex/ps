import { createFileRoute } from '@tanstack/react-router'

import { WmsLayerHistoryCompare } from '../../../../../../../formsAndLists/wmsLayer/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/wms-layers/$wmsLayerId_/histories/$wmsLayerHistoryId'

export const Route = createFileRoute(from)({
  component: WmsLayerHistoryCompare,
})
