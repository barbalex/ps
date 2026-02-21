import { createFileRoute } from '@tanstack/react-router'

import { ProjectReportDesign } from '../../../../../formsAndLists/projectReportDesign/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/designs/$projectReportDesignId/',
)({
  component: ProjectReportDesign,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (
      !params.projectReportDesignId ||
      params.projectReportDesignId === 'undefined'
    ) {
      throw new Error(
        'Invalid or missing projectReportDesignId in route parameters',
      )
    }
    return {
      navDataFetcher: 'useProjectReportDesignNavData',
    }
  },
})
