import { createFileRoute } from '@tanstack/react-router'

import { PlaceCheckReportHistoryCompare } from '../../../../../../../../../../../formsAndLists/placeCheckReport/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$placeCheckReportId_/histories/$placeCheckReportHistoryId'

export const Route = createFileRoute(from)({
  component: () => <PlaceCheckReportHistoryCompare from={from} />,
})
