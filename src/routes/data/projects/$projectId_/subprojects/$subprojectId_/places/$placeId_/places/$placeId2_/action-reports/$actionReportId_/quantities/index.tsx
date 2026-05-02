import { createFileRoute } from '@tanstack/react-router'

import { ActionReportQuantities } from '../../../../../../../../../../../../../formsAndLists/actionReportQuantities.tsx'
import { NotFound } from '../../../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/$actionReportId_/quantities/')({
  component: () => (
    <ActionReportQuantities from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/$actionReportId_/quantities/" hideTitle={true} />
  ),
  notFoundComponent: NotFound,
})
