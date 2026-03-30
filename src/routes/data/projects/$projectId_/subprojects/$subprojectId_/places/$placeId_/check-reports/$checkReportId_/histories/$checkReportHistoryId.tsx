import { createFileRoute } from '@tanstack/react-router'

import { CheckReportHistoryCompare } from '../../../../../../../../../../../formsAndLists/checkReport/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$checkReportId_/histories/$checkReportHistoryId'

export const Route = createFileRoute(from)({
  component: () => <CheckReportHistoryCompare from={from} />,
})
