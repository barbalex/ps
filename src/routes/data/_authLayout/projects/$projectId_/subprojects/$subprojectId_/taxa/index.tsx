import { createFileRoute } from '@tanstack/react-router'

import { SubprojectTaxa } from '../../../../../../../../formsAndLists/subprojectTaxa.tsx'
import { NotFound } from '../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/taxa/',
)({
  component: SubprojectTaxa,
  notFoundComponent: NotFound,
})
