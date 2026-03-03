import { createFileRoute } from '@tanstack/react-router'

import { ProjectReportPrint } from '../../../../../formsAndLists/projectReport/Print.tsx'

const from = '/data/projects/$projectId_/reports/$projectReportId/print'

export const Route = createFileRoute(from)({
  component: () => (
    <ProjectReportPrint from="/data/projects/$projectId_/reports/$projectReportId/print" />
  ),
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
