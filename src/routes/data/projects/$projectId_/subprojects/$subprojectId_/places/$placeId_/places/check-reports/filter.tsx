import { createFileRoute } from '@tanstack/react-router'

import { CheckReportFilter } from '../../../../../../../../../../formsAndLists/checkReport/Filter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/check-reports/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/check-reports/filter',
)({
  component: () => <CheckReportFilter from={from} />,
})
