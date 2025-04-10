import { createFileRoute } from '@tanstack/react-router'

import { Charts } from '../../../../../../../formsAndLists/charts.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/charts/',
)({
  component: Charts,
  notFoundComponent: NotFound,
})
