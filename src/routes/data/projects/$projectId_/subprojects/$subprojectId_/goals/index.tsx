import { createFileRoute } from '@tanstack/react-router'

import { Goals } from '../../../../../../../formsAndLists/goals.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/',
)({
  component: Goals,
  notFoundComponent: NotFound,
})
