import { createFileRoute } from '@tanstack/react-router'

import { WmsLayerHistoryCompare } from '../../../../../../../formsAndLists/wmsLayer/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/wms-layers/$wmsLayerId_/histories/$wmsLayerHistoryId')({
  component: WmsLayerHistoryCompare,
})
