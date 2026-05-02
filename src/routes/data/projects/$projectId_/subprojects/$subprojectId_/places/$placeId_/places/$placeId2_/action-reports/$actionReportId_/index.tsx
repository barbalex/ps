import { createFileRoute } from '@tanstack/react-router'

import { ActionReportIndex } from '../../../../../../../../../../../../formsAndLists/actionReport/index.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/$actionReportId_/')({
  component: () => (
    <ActionReportIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/$actionReportId_/" />
  ),
})
