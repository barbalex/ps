import { createFileRoute } from '@tanstack/react-router'

import { ActionReportQuantity } from '../../../../../../../../../../../formsAndLists/actionReportQuantity/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$actionReportId_/quantities/$actionReportQuantityId/'

export const Route = createFileRoute(from)({
  component: () => (
    <ActionReportQuantity from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$actionReportId_/quantities/$actionReportQuantityId/" />
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
    if (!params.placeActionReportId || params.placeActionReportId === 'undefined') {
      throw new Error('Invalid or missing placeActionReportId in route parameters')
    }
    if (
      !params.actionReportQuantityId ||
      params.actionReportQuantityId === 'undefined'
    ) {
      throw new Error(
        'Invalid or missing actionReportQuantityId in route parameters',
      )
    }
    return {
      navDataFetcher: 'usePlaceActionReportQuantityNavData',
    }
  },
})
