import { createFileRoute } from '@tanstack/react-router'

import { CheckReport } from '../../../../../../../../../../formsAndLists/checkReport/CheckReport.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/check-reports/$checkReportId/')({
  component: () => (
    <CheckReport from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/check-reports/$checkReportId/" />
  ),
})
