import { createFileRoute } from '@tanstack/react-router'

import { WfsServiceHistoryCompare } from '../../../../../../../formsAndLists/wfsService/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/histories/$wfsServiceHistoryId'

export const Route = createFileRoute(from)({
  component: WfsServiceHistoryCompare,
})
