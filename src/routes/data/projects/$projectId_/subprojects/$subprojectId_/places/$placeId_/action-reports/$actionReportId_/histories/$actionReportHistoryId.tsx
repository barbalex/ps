import { createFileRoute } from '@tanstack/react-router'

import { ActionReportHistoryCompare } from '../../../../../../../../../../../formsAndLists/actionReport/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$actionReportId_/histories/$actionReportHistoryId'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$actionReportId_/histories/$actionReportHistoryId')({
  component: () => <ActionReportHistoryCompare from={from} />,
})
