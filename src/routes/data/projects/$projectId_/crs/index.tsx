import { createFileRoute } from '@tanstack/react-router'

import { ProjectCrss } from '../../../../../formsAndLists/projectCrss'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/crs/')({
  component: ProjectCrss,
  notFoundComponent: NotFound,
})
