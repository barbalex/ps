import { createFileRoute } from '@tanstack/react-router'

import { ObservationImports } from '../../../../../../../formsAndLists/observationImports.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/observation-imports/',
)({
  component: ObservationImports,
  notFoundComponent: NotFound,
})
