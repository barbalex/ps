import { createFileRoute } from '@tanstack/react-router'

import { PlaceReportValue } from '../../../../../../../../../../../../../formsAndLists/placeReportValue/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/$placeReportId_/values/$placeReportValueId',
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
    if (!params.placeReportId_ || params.placeReportId_ === 'undefined') {
      throw new Error('Invalid or missing placeReportId_ in route parameters')
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
    <PlaceReportValue from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/$placeReportId_/values/$placeReportValueId" />
  )
}
