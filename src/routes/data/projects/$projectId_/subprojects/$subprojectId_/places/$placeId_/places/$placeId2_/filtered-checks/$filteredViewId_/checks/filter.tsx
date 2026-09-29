import { createFileRoute } from '@tanstack/react-router'

import { FilteredCheckFilter } from '../../../../../../../../../../../../../formsAndLists/filteredCheck/Filter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/filtered-checks/$filteredViewId_/checks/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/filtered-checks/$filteredViewId_/checks/filter',
)({
  component: () => <FilteredCheckFilter from={from} level={2} />,
})
