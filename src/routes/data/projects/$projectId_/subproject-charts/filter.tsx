import { createFileRoute } from '@tanstack/react-router'

import { ChartFilter } from '../../../../../formsAndLists/chart/Filter.tsx'

const from = '/data/projects/$projectId_/subproject-charts/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subproject-charts/filter',
)({
  component: () => <ChartFilter from={from} />,
})
