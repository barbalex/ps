import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReportDesign } from '../../../../../../../formsAndLists/subprojectReportDesign/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/designs/$subprojectReportDesignId/',
)({
  component: SubprojectReportDesign,
  beforeLoad: () => ({
    navDataFetcher: 'useSubprojectReportDesignNavData',
  }),
})
