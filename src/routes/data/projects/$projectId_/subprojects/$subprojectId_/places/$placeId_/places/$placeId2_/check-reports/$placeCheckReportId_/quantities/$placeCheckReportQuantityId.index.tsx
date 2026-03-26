import { createFileRoute } from '@tanstack/react-router'

import { PlaceCheckReportQuantity } from '../../../../../../../../../../../../../formsAndLists/placeCheckReportQuantity/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/check-reports/$placeCheckReportId_/quantities/$placeCheckReportQuantityId/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceCheckReportQuantity from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/check-reports/$placeCheckReportId_/quantities/$placeCheckReportQuantityId/" />
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
    if (!params.placeId2 || params.placeId2 === 'undefined') {
      throw new Error('Invalid or missing placeId2 in route parameters')
    }
    if (!params.placeCheckReportId || params.placeCheckReportId === 'undefined') {
      throw new Error('Invalid or missing placeCheckReportId in route parameters')
    }
    if (
      !params.placeCheckReportQuantityId ||
      params.placeCheckReportQuantityId === 'undefined'
    ) {
      throw new Error(
        'Invalid or missing placeCheckReportQuantityId in route parameters',
      )
    }
    return {
      navDataFetcher: 'usePlaceCheckReportQuantityNavData',
    }
  },
})
