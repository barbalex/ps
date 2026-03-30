import { createFileRoute } from '@tanstack/react-router'

import { ActionReportFilter } from '../../../../../../../../../formsAndLists/actionReport/Filter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/filter',
)({
  component: () => <ActionReportFilter from={from} level={1} />,
})
