import { createFileRoute } from '@tanstack/react-router'

import { PlaceCheckReportFilter } from '../../../../../../../../../formsAndLists/placeCheckReport/Filter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/filter',
)({
  component: () => <PlaceCheckReportFilter from={from} level={1} />,
})
