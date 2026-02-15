import { createFileRoute } from '@tanstack/react-router'

import { ActionReport } from '../../../../../../../../../../../../formsAndLists/actionReport/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId_/report',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (!params.placeId || params.placeId === 'undefined') {
      throw new Error('Invalid or missing placeId in route parameters')
    }
    if (!params.actionId || params.actionId === 'undefined') {
      throw new Error('Invalid or missing actionId in route parameters')
    }
    if (!params.actionReportId || params.actionReportId === 'undefined') {
      throw new Error('Invalid or missing actionReportId in route parameters')
    }
    return {
    navDataFetcher: 'useActionReportReportNavData',
  }
  },
})

function RouteComponent() {
  return (
    <ActionReport from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId_/report" />
  )
}
