import { createFileRoute } from '@tanstack/react-router'

import { ChartFilter } from '../../../../../../../formsAndLists/chart/Filter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/charts/filter'

export const Route = createFileRoute(from)({
  component: () => <ChartFilter from={from} />,
})
