import { createFileRoute } from '@tanstack/react-router'

import { ChartSubject } from '../../../../../../../../../formsAndLists/chartSubject/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/subjects/$chartSubjectId/',
)({
  component: ChartSubject,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.subprojectId_ || params.subprojectId_ === 'undefined') {
      throw new Error('Invalid or missing subprojectId_ in route parameters')
    }
    if (!params.chartId_ || params.chartId_ === 'undefined') {
      throw new Error('Invalid or missing chartId_ in route parameters')
    }
    if (!params.chartSubjectId || params.chartSubjectId === 'undefined') {
      throw new Error('Invalid or missing chartSubjectId in route parameters')
    }
    return {
    navDataFetcher: 'useChartSubjectNavData',
  }
  },
})
