import { createFileRoute } from '@tanstack/react-router'

import { ActionReport } from '../../../../../../../../../../../../formsAndLists/actionReport/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId_/report',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.subprojectId_ || params.subprojectId_ === 'undefined') {
      throw new Error('Invalid or missing subprojectId_ in route parameters')
    }
    if (!params.placeId_ || params.placeId_ === 'undefined') {
      throw new Error('Invalid or missing placeId_ in route parameters')
    }
    if (!params.actionId_ || params.actionId_ === 'undefined') {
      throw new Error('Invalid or missing actionId_ in route parameters')
    }
    if (!params.actionReportId_ || params.actionReportId_ === 'undefined') {
      throw new Error('Invalid or missing actionReportId_ in route parameters')
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
