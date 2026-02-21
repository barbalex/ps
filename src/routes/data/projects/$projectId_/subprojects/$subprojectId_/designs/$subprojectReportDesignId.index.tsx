import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReportDesign } from '../../../../../../../formsAndLists/subprojectReportDesign/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/designs/$subprojectReportDesignId/',
)({
  component: SubprojectReportDesign,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (
      !params.subprojectReportDesignId ||
      params.subprojectReportDesignId === 'undefined'
    ) {
      throw new Error(
        'Invalid or missing subprojectReportDesignId in route parameters',
      )
    }
    return {
      navDataFetcher: 'useSubprojectReportDesignNavData',
    }
  },
})
