import { createFileRoute } from '@tanstack/react-router'

import { PlaceActionReportQuantity } from '../../../../../../../../../../../../../formsAndLists/placeActionReportQuantity/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/$placeActionReportId_/quantities/$placeActionReportQuantityId/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceActionReportQuantity from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/$placeActionReportId_/quantities/$placeActionReportQuantityId/" />
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
    if (
      !params.placeActionReportId ||
      params.placeActionReportId === 'undefined'
    ) {
      throw new Error(
        'Invalid or missing placeActionReportId in route parameters',
      )
    }
    if (
      !params.placeActionReportQuantityId ||
      params.placeActionReportQuantityId === 'undefined'
    ) {
      throw new Error(
        'Invalid or missing placeActionReportQuantityId in route parameters',
      )
    }
    return {
      navDataFetcher: 'usePlaceActionReportQuantityNavData',
    }
  },
})
