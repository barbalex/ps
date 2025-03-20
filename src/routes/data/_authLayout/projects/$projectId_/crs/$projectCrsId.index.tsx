import { createFileRoute } from '@tanstack/react-router'

import { ProjectCrs } from '../../../../../../formsAndLists/projectCrs/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/crs/$projectCrsId/',
)({
  component: ProjectCrs,
})
