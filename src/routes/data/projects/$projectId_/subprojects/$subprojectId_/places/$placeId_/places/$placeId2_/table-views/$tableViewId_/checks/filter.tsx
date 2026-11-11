import { createFileRoute } from '@tanstack/react-router'

import { TableCheckFilter } from '../../../../../../../../../../../../../formsAndLists/tableCheck/Filter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/table-views/$tableViewId_/checks/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/table-views/$tableViewId_/checks/filter',
)({
  component: () => <TableCheckFilter from={from} level={2} />,
})
