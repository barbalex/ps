import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReportDesign } from '../../../../../formsAndLists/subprojectReportDesign'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subproject-designs/$subprojectReportDesignId/',
)({
  component: SubprojectReportDesign,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
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
