import { createFileRoute } from '@tanstack/react-router'

import { PlaceActionReportFilter } from '../../../../../../../../../formsAndLists/placeActionReport/Filter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/filter',
)({
  component: () => <PlaceActionReportFilter from={from} level={1} />,
})
