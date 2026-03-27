import { createFileRoute } from '@tanstack/react-router'
import { QuantitiesWrapper } from '../-quantities-wrapper.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$placeActionReportId_/quantities',
)({
  component: QuantitiesWrapper,
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
    if (
      !params.placeActionReportId ||
      params.placeActionReportId === 'undefined'
    ) {
      throw new Error(
        'Invalid or missing placeActionReportId in route parameters',
      )
    }
    return {
      navDataFetcher: 'usePlaceActionReportQuantitiesNavData',
    }
  },
})
