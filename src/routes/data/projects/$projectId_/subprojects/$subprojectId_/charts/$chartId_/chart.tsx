import { createFileRoute } from '@tanstack/react-router'

import { Chart } from '../../../../../../../../formsAndLists/chart/index.tsx'
import { NotFound } from '../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/chart'

export const Route = createFileRoute(from)({
  component: () => (
    <Chart from="/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/chart" />
  ),
  notFoundComponent: NotFound,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (!params.chartId || params.chartId === 'undefined') {
      throw new Error('Invalid or missing chartId in route parameters')
    }
    return {
      navDataFetcher: 'useChartChartNavData',
    }
  },
})
