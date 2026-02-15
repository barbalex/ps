import { createFileRoute } from '@tanstack/react-router'

import { ProjectReport } from '../../../../../formsAndLists/projectReport/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/reports/$projectReportId/',
)({
  component: ProjectReport,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.projectReportId || params.projectReportId === 'undefined') {
      throw new Error('Invalid or missing projectReportId in route parameters')
    }
    return {
    navDataFetcher: 'useProjectReportNavData',
  }
  },
})
