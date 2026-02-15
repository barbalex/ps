import { createFileRoute } from '@tanstack/react-router'

import { PlaceReportValue } from '../../../../../../../../../../../formsAndLists/placeReportValue/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/$placeReportId_/values/$placeReportValueId/',
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
    if (!params.placeReportId || params.placeReportId === 'undefined') {
      throw new Error('Invalid or missing placeReportId in route parameters')
    }
    if (!params.placeReportValueId || params.placeReportValueId === 'undefined') {
      throw new Error('Invalid or missing placeReportValueId in route parameters')
    }
    return {
    navDataFetcher: 'usePlaceReportValueNavData',
  }
  },
})

function RouteComponent() {
  return (
    <PlaceReportValue from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/$placeReportId_/values/$placeReportValueId/" />
  )
}
