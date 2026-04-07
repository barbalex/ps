import { createFileRoute } from '@tanstack/react-router'

import { ActionReportQuantity } from '../../../../../../../../../../../../../formsAndLists/actionReportQuantity'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/$actionReportId_/quantities/$actionReportQuantityId/'

export const Route = createFileRoute(from)({
  component: () => (
    <ActionReportQuantity from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/$actionReportId_/quantities/$actionReportQuantityId/" />
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
      !params.actionReportId ||
      params.actionReportId === 'undefined'
    ) {
      throw new Error(
        'Invalid or missing actionReportId in route parameters',
      )
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
      navDataFetcher: 'useActionReportQuantityNavData',
    }
  },
})
