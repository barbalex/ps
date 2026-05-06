import { createFileRoute } from '@tanstack/react-router'

import { ProjectExport } from '../../../../../formsAndLists/projectExport/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/exports/$projectExportsId/',
)({
  component: ProjectExport,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.projectExportsId || params.projectExportsId === 'undefined') {
      throw new Error('Invalid or missing projectExportsId in route parameters')
    }
    return {
      navDataFetcher: 'useProjectOwnExportNavData',
    }
  },
})
