import { createFileRoute } from '@tanstack/react-router'

import { SubprojectHistories } from '../../../../../../../formsAndLists/subprojectHistories.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/histories/',
)({
  component: SubprojectHistories,
  notFoundComponent: NotFound,
})
