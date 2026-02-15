import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReportDesign } from '../../../../../../../formsAndLists/subprojectReportDesign/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/designs/$subprojectReportDesignId/',
)({
  component: SubprojectReportDesign,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.subprojectId_ || params.subprojectId_ === 'undefined') {
      throw new Error('Invalid or missing subprojectId_ in route parameters')
    }
    if (!params.subprojectReportDesignId || params.subprojectReportDesignId === 'undefined') {
      throw new Error('Invalid or missing subprojectReportDesignId in route parameters')
    }
    return {
    navDataFetcher: 'useSubprojectReportDesignNavData',
  }
  },
})
