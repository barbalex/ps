import { createFileRoute } from '@tanstack/react-router'

import { WmsServiceLayerHistoryCompare } from '../../../../../../../../../formsAndLists/wmsServiceLayer/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/wms-services/$wmsServiceId_/layers/$wmsServiceLayerId_/histories/$wmsServiceLayerHistoryId')({
  component: WmsServiceLayerHistoryCompare,
})
