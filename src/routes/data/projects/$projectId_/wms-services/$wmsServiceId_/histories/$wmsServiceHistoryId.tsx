import { createFileRoute } from '@tanstack/react-router'

import { WmsServiceHistoryCompare } from '../../../../../../../formsAndLists/wmsService/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/wms-services/$wmsServiceId_/histories/$wmsServiceHistoryId')({
  component: WmsServiceHistoryCompare,
})
