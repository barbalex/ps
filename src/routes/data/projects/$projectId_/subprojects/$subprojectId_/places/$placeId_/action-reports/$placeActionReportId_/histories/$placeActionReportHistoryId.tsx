import { createFileRoute } from '@tanstack/react-router'

import { PlaceActionReportHistoryCompare } from '../../../../../../../../../../../formsAndLists/placeActionReport/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$placeActionReportId_/histories/$placeActionReportHistoryId'

export const Route = createFileRoute(from)({
  component: () => <PlaceActionReportHistoryCompare from={from} />,
})
