import { createFileRoute } from '@tanstack/react-router'

import { FilteredViewFilter } from '../../../../../formsAndLists/filteredView/Filter.tsx'

const from = '/data/projects/$projectId_/filtered-views/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/filtered-views/filter',
)({
  component: () => <FilteredViewFilter from={from} />,
})
