import { createFileRoute } from '@tanstack/react-router'

import { PlaceReportQuantity } from '../../../../../../../../../../../formsAndLists/placeReportQuantity/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/$placeReportId_/quantities/$placeReportQuantityId/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceReportQuantity from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/$placeReportId_/quantities/$placeReportQuantityId/" />
  ),
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
    if (
      !params.placeReportQuantityId ||
      params.placeReportQuantityId === 'undefined'
    ) {
      throw new Error(
        'Invalid or missing placeReportQuantityId in route parameters',
      )
    }
    return {
      navDataFetcher: 'usePlaceReportQuantityNavData',
    }
  },
})
