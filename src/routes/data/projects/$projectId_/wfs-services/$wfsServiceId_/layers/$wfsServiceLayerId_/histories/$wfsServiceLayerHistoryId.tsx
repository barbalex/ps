import { createFileRoute } from '@tanstack/react-router'

import { WfsServiceLayerHistoryCompare } from '../../../../../../../../../formsAndLists/wfsServiceLayer/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/wfs-services/$wfsServiceId_/layers/$wfsServiceLayerId_/histories/$wfsServiceLayerHistoryId')({
  component: WfsServiceLayerHistoryCompare,
})
