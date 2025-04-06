import { createFileRoute } from '@tanstack/react-router'

import { ChartList } from '../../../../../../../../../formsAndLists/chart/List.tsx'
import { NotFound } from '../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

const RouteComponent = () => {
  return (
    <ChartList from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/" />
  )
}
