import { createFileRoute } from '@tanstack/react-router'

import { ChartSubjects } from '../../../../../../../../../../formsAndLists/chartSubjects.tsx'
import { NotFound } from '../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/subjects/',
)({
  component: ChartSubjects,
  notFoundComponent: NotFound,
})
