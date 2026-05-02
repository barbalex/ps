import { createFileRoute } from '@tanstack/react-router'

import { ProjectQcHistoryCompare } from '../../../../../../../formsAndLists/projectQc/HistoryCompare.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/qcs/$projectQcId_/histories/$projectQcHistoryId',
)({
  component: ProjectQcHistoryCompare,
})
