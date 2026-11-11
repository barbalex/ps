import { createFileRoute } from '@tanstack/react-router'

import { TableViewsTables } from '../../../../../formsAndLists/tableViewsTables.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/table-views/',
)({
  component: TableViewsTables,
  notFoundComponent: NotFound,
})
