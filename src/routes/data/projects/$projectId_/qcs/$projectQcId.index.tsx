import { createFileRoute } from '@tanstack/react-router'

import { ProjectQc } from '../../../../../formsAndLists/projectQc/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/qcs/$projectQcId/',
)({
  component: ProjectQc,
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
