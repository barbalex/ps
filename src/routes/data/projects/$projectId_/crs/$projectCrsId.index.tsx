import { createFileRoute } from '@tanstack/react-router'

import { ProjectCrs } from '../../../../../formsAndLists/projectCrs/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/crs/$projectCrsId/',
)({
  component: ProjectCrs,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.projectCrsId || params.projectCrsId === 'undefined') {
      throw new Error('Invalid or missing projectCrsId in route parameters')
    }
    return {
    navDataFetcher: 'useProjectCrsNavData',
  }
  },
})
