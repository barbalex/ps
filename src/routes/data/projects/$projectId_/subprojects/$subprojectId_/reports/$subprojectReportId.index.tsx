import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReport } from '../../../../../../../formsAndLists/subprojectReport/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/reports/$subprojectReportId/',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.subprojectId_ || params.subprojectId_ === 'undefined') {
      throw new Error('Invalid or missing subprojectId_ in route parameters')
    }
    if (!params.subprojectReportId || params.subprojectReportId === 'undefined') {
      throw new Error('Invalid or missing subprojectReportId in route parameters')
    }
    return {
    navDataFetcher: 'useSubprojectReportNavData',
  }
  },
})

function RouteComponent() {
  return (
    <SubprojectReport from="/data/projects/$projectId_/subprojects/$subprojectId_/reports/$subprojectReportId/" />
  )
}
