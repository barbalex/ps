import { createFileRoute } from '@tanstack/react-router'

import { ChartList } from '../../../../../../../../formsAndLists/chart/List.tsx'
import { NotFound } from '../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/')({
  component: () => (
    <ChartList from="/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/" />
  ),
  notFoundComponent: NotFound,
})
