import { createFileRoute } from '@tanstack/react-router'

import { TableActionFilter } from '../../../../../../../../../../../../../formsAndLists/tableAction/Filter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/table-views/$tableViewId_/actions/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/table-views/$tableViewId_/actions/filter',
)({
  component: () => <TableActionFilter from={from} level={2} />,
})
