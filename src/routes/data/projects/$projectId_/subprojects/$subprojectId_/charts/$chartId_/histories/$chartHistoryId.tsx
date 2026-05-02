import { createFileRoute } from '@tanstack/react-router'

import { ChartHistoryCompare } from '../../../../../../../../../formsAndLists/chart/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/histories/$chartHistoryId')({
  component: ChartHistoryCompare,
})
