import { createFileRoute } from '@tanstack/react-router'

import { PlaceCheckReportQuantityHistoryCompare } from '../../../../../../../../../../../../../formsAndLists/placeCheckReportQuantity/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$placeCheckReportId_/quantities/$placeCheckReportQuantityId_/histories/$placeCheckReportQuantityHistoryId'

export const Route = createFileRoute(from)({
  component: () => <PlaceCheckReportQuantityHistoryCompare from={from} />,
})
