import { createFileRoute } from '@tanstack/react-router'

import { ChartSubject } from '../../../../../../../../../../formsAndLists/chartSubject/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/subjects/$chartSubjectId/',
)({
  component: ChartSubject,
  beforeLoad: () => ({
    navDataFetcher: 'useChartSubjectNavData',
  }),
})
