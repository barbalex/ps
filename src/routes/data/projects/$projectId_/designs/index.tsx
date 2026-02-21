import { createFileRoute } from '@tanstack/react-router'

import { ProjectReportDesigns } from '../../../../../formsAndLists/projectReportDesigns.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/designs/')({
  component: ProjectReportDesigns,
  notFoundComponent: NotFound,
})
