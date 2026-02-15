import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReport } from '../../../../../../../formsAndLists/subprojectReport/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/reports/$subprojectReportId/',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
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
