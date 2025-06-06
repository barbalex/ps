import { createFileRoute } from '@tanstack/react-router'

import { Lists } from '../../../../../formsAndLists/lists.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/lists/',
)({
  component: Lists,
  notFoundComponent: NotFound,
})
