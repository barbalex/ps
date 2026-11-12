import { createFileRoute } from '@tanstack/react-router'

import { TableActions } from '../../../../../../../../../../../formsAndLists/tableActions.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/table-views/$tableViewId_/actions/')({
  component: () => (
    <TableActions from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/table-views/$tableViewId_/actions/" />
  ),
  notFoundComponent: NotFound,
})
