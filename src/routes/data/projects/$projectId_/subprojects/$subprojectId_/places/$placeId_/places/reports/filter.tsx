import { createFileRoute } from '@tanstack/react-router'

import { PlaceReportFilter } from '../../../../../../../../../../formsAndLists/placeReport/Filter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/reports/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/reports/filter',
)({
  component: () => <PlaceReportFilter from={from} />,
})
