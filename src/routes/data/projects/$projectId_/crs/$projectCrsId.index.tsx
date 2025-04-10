import { createFileRoute } from '@tanstack/react-router'

import { ProjectCrs } from '../../../../../formsAndLists/projectCrs/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/crs/$projectCrsId/',
)({
  component: ProjectCrs,
  beforeLoad: () => ({
    navDataFetcher: 'useProjectCrsNavData',
  }),
})
