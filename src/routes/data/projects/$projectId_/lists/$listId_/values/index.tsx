import { createFileRoute } from '@tanstack/react-router'

import { ListValues } from '../../../../../../../formsAndLists/listValues.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/lists/$listId_/values/',
)({
  component: ListValues,
  notFoundComponent: NotFound,
})
