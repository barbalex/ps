import { createFileRoute } from '@tanstack/react-router'
import { PlaceCheckReportLayout } from './-layout.tsx'
import { NotFound } from '../../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/check-reports/$placeCheckReportId_',
)({
  component: PlaceCheckReportLayout,
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
    if (!params.placeId2 || params.placeId2 === 'undefined') {
      throw new Error('Invalid or missing placeId2 in route parameters')
    }
    if (!params.placeCheckReportId || params.placeCheckReportId === 'undefined') {
      throw new Error('Invalid or missing placeCheckReportId in route parameters')
    }
    return {
      navDataFetcher: 'usePlaceCheckReportNavData',
    }
  },
})
