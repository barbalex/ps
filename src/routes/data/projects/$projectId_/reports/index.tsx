import { createFileRoute } from '@tanstack/react-router'

import { ProjectReports } from '../../../../../formsAndLists/projectReports.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/reports/',
)({
  component: ProjectReports,
  notFoundComponent: NotFound,
})
