import { createFileRoute } from '@tanstack/react-router'

import { ChartHistoryCompare } from '../../../../../../../../../formsAndLists/chart/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/histories/$chartHistoryId'

export const Route = createFileRoute(from)({
  component: ChartHistoryCompare,
})
