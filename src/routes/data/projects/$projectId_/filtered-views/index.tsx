import { createFileRoute } from '@tanstack/react-router'

import { FilteredViews } from '../../../../../formsAndLists/filteredViews.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/filtered-views/',
)({
  component: FilteredViews,
  notFoundComponent: NotFound,
})
