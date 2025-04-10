import { createFileRoute } from '@tanstack/react-router'

import { Chart } from '../../../../../../../../formsAndLists/chart/index.tsx'
import { NotFound } from '../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/chart',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

const RouteComponent = () => {
  return (
    <Chart from="/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/chart" />
  )
}
