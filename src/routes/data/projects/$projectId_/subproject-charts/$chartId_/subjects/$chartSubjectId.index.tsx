import { createFileRoute } from '@tanstack/react-router'

import { ChartSubject } from '../../../../../../../formsAndLists/chartSubject/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subproject-charts/$chartId_/subjects/$chartSubjectId/',
)({
  component: ChartSubject,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.chartId || params.chartId === 'undefined') {
      throw new Error('Invalid or missing chartId in route parameters')
    }
    if (!params.chartSubjectId || params.chartSubjectId === 'undefined') {
      throw new Error('Invalid or missing chartSubjectId in route parameters')
    }
    return {
      navDataFetcher: 'useSubprojectChartSubjectNavData',
    }
  },
})
