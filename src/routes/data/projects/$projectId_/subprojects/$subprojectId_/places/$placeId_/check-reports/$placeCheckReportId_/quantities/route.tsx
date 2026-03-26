import { createFileRoute } from '@tanstack/react-router'
import { PlaceCheckReportWithQuantities } from '../../../../../../../../../../../formsAndLists/placeCheckReport/WithQuantities.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$placeCheckReportId_'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$placeCheckReportId_/quantities',
)({
  component: () => <PlaceCheckReportWithQuantities from={from} />,
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
    if (!params.placeCheckReportId || params.placeCheckReportId === 'undefined') {
      throw new Error('Invalid or missing placeCheckReportId in route parameters')
    }
    return {
      navDataFetcher: 'usePlaceCheckReportQuantitiesNavData',
    }
  },
})
