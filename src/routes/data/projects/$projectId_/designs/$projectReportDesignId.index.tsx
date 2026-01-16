import { createFileRoute } from '@tanstack/react-router'

import { ProjectReportDesign } from '../../../../../formsAndLists/projectReportDesign/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/designs/$projectReportDesignId/',
)({
  component: ProjectReportDesign,
  beforeLoad: () => ({
    navDataFetcher: 'useProjectReportDesignNavData',
  }),
})
