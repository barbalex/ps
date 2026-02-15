import { createFileRoute } from '@tanstack/react-router'

import { Chart } from '../../../../../../../../formsAndLists/chart/index.tsx'
import { NotFound } from '../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/chart',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
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
    return {
    navDataFetcher: 'useChartChartNavData',
  }
  },
})

const RouteComponent = () => {
  return (
    <Chart from="/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/chart" />
  )
}
