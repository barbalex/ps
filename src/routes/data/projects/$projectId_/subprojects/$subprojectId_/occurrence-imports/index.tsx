import { createFileRoute } from '@tanstack/react-router'

import { OccurrenceImports } from '../../../../../../../formsAndLists/occurrenceImports.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/occurrence-imports/',
)({
  component: OccurrenceImports,
  notFoundComponent: NotFound,
})
