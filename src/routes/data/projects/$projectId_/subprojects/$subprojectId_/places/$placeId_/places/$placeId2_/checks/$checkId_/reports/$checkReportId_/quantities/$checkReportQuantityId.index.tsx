import { createFileRoute } from '@tanstack/react-router'

import { CheckReportQuantity } from '../../../../../../../../../../../../../../../formsAndLists/checkReportQuantity/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/reports/$checkReportId_/quantities/$checkReportQuantityId/'

export const Route = createFileRoute(from)({
  component: () => (
    <CheckReportQuantity from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/reports/$checkReportId_/quantities/$checkReportQuantityId/" />
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
    if (!params.checkId || params.checkId === 'undefined') {
      throw new Error('Invalid or missing checkId in route parameters')
    }
    if (!params.checkReportId || params.checkReportId === 'undefined') {
      throw new Error('Invalid or missing checkReportId in route parameters')
    }
    if (
      !params.checkReportQuantityId ||
      params.checkReportQuantityId === 'undefined'
    ) {
      throw new Error(
        'Invalid or missing checkReportQuantityId in route parameters',
      )
    }
    return {
      navDataFetcher: 'useCheckReportQuantityNavData',
    }
  },
})
