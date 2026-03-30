import { createFileRoute } from '@tanstack/react-router'

import { CheckReportQuantityHistoryCompare } from '../../../../../../../../../../../../../formsAndLists/checkReportQuantity/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$checkReportId_/quantities/$checkReportQuantityId_/histories/$checkReportQuantityHistoryId'

export const Route = createFileRoute(from)({
  component: () => <CheckReportQuantityHistoryCompare from={from} />,
})
