import { createFileRoute } from '@tanstack/react-router'

import { ProjectExports } from '../../../../../formsAndLists/projectExports.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/exports/')({
  component: ProjectExports,
  notFoundComponent: NotFound,
})
