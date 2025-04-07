import { createFileRoute } from '@tanstack/react-router'

import { ProjectReport } from '../../../../../../formsAndLists/projectReport/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/reports/$projectReportId/',
)({
  component: ProjectReport,
  beforeLoad: () => ({
    navDataFetcher: 'useProjectReportNavData',
  }),
})
