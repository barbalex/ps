import { createFileRoute } from '@tanstack/react-router'

import { Subprojects } from '../../../../../formsAndLists/subprojects.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/',
)({
  component: Subprojects,
  notFoundComponent: NotFound,
})
