import { createFileRoute } from '@tanstack/react-router'

import { WfsServiceHistoryCompare } from '../../../../../../../formsAndLists/wfsService/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/wfs-services/$wfsServiceId_/histories/$wfsServiceHistoryId')({
  component: WfsServiceHistoryCompare,
})
