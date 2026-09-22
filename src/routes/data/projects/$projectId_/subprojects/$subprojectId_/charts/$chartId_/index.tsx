import { createFileRoute } from '@tanstack/react-router'

import { Chart } from '../../../../../../../../formsAndLists/chart/index.tsx'
import { NotFound } from '../../../../../../../../components/NotFound.tsx'

// the chart itself renders at the node's url — no extra /chart depth
export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/')({
  component: () => (
    <Chart from="/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/" />
  ),
  notFoundComponent: NotFound,
})
