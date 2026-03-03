import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReportDesigns } from '../../../../../formsAndLists/subprojectReportDesigns.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subproject-designs/',
)({
  component: SubprojectReportDesigns,
  notFoundComponent: NotFound,
})
