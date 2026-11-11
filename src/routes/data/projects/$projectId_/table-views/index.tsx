import { createFileRoute } from '@tanstack/react-router'

import { TableViews } from '../../../../../formsAndLists/tableViews.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/table-views/',
)({
  component: TableViews,
  notFoundComponent: NotFound,
})
