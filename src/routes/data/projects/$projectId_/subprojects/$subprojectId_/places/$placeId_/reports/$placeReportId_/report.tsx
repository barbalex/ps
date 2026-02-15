import { createFileRoute } from '@tanstack/react-router'

import { PlaceReport } from '../../../../../../../../../../formsAndLists/placeReport/index.tsx'
import { NotFound } from '../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/$placeReportId_/report',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
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
    if (!params.placeReportId_ || params.placeReportId_ === 'undefined') {
      throw new Error('Invalid or missing placeReportId_ in route parameters')
    }
    return {
    navDataFetcher: 'usePlaceReportReportNavData',
  }
  },
})

function RouteComponent() {
  return (
    <PlaceReport from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/$placeReportId_/report" />
  )
}
