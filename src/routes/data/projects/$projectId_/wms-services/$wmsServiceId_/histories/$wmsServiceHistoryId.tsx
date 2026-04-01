import { createFileRoute } from '@tanstack/react-router'

import { WmsServiceHistoryCompare } from '../../../../../../../formsAndLists/wmsService/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/wms-services/$wmsServiceId_/histories/$wmsServiceHistoryId'

export const Route = createFileRoute(from)({
  component: WmsServiceHistoryCompare,
})
