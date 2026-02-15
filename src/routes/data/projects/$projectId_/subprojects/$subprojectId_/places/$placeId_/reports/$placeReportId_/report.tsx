import { createFileRoute } from '@tanstack/react-router'

import { PlaceReport } from '../../../../../../../../../../formsAndLists/placeReport/index.tsx'
import { NotFound } from '../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/$placeReportId_/report',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
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
