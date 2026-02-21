import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReport } from '../../../../../../../formsAndLists/subprojectReport/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/reports/$subprojectReportId/'

export const Route = createFileRoute(from)({
  component: () => (
    <SubprojectReport from="/data/projects/$projectId_/subprojects/$subprojectId_/reports/$subprojectReportId/" />
  ),
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (
      !params.subprojectReportId ||
      params.subprojectReportId === 'undefined'
    ) {
      throw new Error(
        'Invalid or missing subprojectReportId in route parameters',
      )
    }
    return {
      navDataFetcher: 'useSubprojectReportNavData',
    }
  },
})
