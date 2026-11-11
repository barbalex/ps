import { createFileRoute } from '@tanstack/react-router'

import { TableChecks } from '../../../../../../../../../../../formsAndLists/tableChecks.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/table-views/$tableViewId_/checks/',
)({
  component: () => (
    <TableChecks from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/table-views/$tableViewId_/checks/" />
  ),
  notFoundComponent: NotFound,
})
