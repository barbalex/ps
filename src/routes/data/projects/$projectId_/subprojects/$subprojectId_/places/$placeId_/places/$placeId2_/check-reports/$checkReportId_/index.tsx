import { createFileRoute } from '@tanstack/react-router'

import { CheckReportIndex } from '../../../../../../../../../../../../formsAndLists/checkReport'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/check-reports/$checkReportId_/')({
  component: () => (
    <CheckReportIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/check-reports/$checkReportId_/" />
  ),
})
