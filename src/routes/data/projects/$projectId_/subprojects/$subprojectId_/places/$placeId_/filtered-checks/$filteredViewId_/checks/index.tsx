import { createFileRoute } from '@tanstack/react-router'

import { FilteredChecks } from '../../../../../../../../../../../formsAndLists/filteredChecks.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/filtered-checks/$filteredViewId_/checks/',
)({
  component: () => (
    <FilteredChecks from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/filtered-checks/$filteredViewId_/checks/" />
  ),
  notFoundComponent: NotFound,
})
