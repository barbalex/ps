import { createFileRoute } from '@tanstack/react-router'

import { ActionReportQuantityHistoryCompare } from '../../../../../../../../../../../../../../../formsAndLists/actionReportQuantity/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/$actionReportId_/quantities/$actionReportQuantityId_/histories/$actionReportQuantityHistoryId'

export const Route = createFileRoute(from)({
  component: () => <ActionReportQuantityHistoryCompare from={from} />,
})
