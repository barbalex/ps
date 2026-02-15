import { createFileRoute } from '@tanstack/react-router'

import { ActionReportValue } from '../../../../../../../../../../../../../../../formsAndLists/actionReportValue/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/reports/$actionReportId_/values/$actionReportValueId/',
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
    if (!params.placeId2 || params.placeId2 === 'undefined') {
      throw new Error('Invalid or missing placeId2 in route parameters')
    }
    if (!params.actionId || params.actionId === 'undefined') {
      throw new Error('Invalid or missing actionId in route parameters')
    }
    if (!params.actionReportId || params.actionReportId === 'undefined') {
      throw new Error('Invalid or missing actionReportId in route parameters')
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
