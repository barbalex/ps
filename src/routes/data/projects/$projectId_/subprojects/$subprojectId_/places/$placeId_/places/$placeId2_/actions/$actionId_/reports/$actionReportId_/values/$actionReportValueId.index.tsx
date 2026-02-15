import { createFileRoute } from '@tanstack/react-router'

import { ActionReportValue } from '../../../../../../../../../../../../../../../formsAndLists/actionReportValue/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/reports/$actionReportId_/values/$actionReportValueId/',
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
    if (!params.placeId2_ || params.placeId2_ === 'undefined') {
      throw new Error('Invalid or missing placeId2_ in route parameters')
    }
    if (!params.actionId_ || params.actionId_ === 'undefined') {
      throw new Error('Invalid or missing actionId_ in route parameters')
    }
    if (!params.actionReportId_ || params.actionReportId_ === 'undefined') {
      throw new Error('Invalid or missing actionReportId_ in route parameters')
    }
    if (!params.actionReportValueId || params.actionReportValueId === 'undefined') {
      throw new Error('Invalid or missing actionReportValueId in route parameters')
    }
    return {
    navDataFetcher: 'useActionReportValueNavData',
  }
  },
})

function RouteComponent() {
  return (
    <ActionReportValue from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/reports/$actionReportId_/values/$actionReportValueId/" />
  )
}
