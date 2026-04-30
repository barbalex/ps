import { createFileRoute } from '@tanstack/react-router'

import { ProjectOwnQc } from '../../../../../formsAndLists/projectOwnQc/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/project-qcs/$projectQcId/',
)({
  component: ProjectOwnQc,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.projectQcId || params.projectQcId === 'undefined') {
      throw new Error('Invalid or missing projectQcId in route parameters')
    }
    return {
      navDataFetcher: 'useProjectOwnQcNavData',
    }
  },
})
