import { createFileRoute } from '@tanstack/react-router'

import { ChartList } from '../../../../../../../../formsAndLists/chart/List.tsx'
import { NotFound } from '../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <ChartList from="/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/" />
  ),
  notFoundComponent: NotFound,
})
