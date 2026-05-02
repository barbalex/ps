import { createFileRoute } from '@tanstack/react-router'

import { ActionReportIndex } from '../../../../../../../../../../formsAndLists/actionReport/index.tsx'
import { NotFound } from '../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$actionReportId_/')({
  component: () => (
    <ActionReportIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$actionReportId_/" />
  ),
  notFoundComponent: NotFound,
})
