import { createFileRoute } from '@tanstack/react-router'

import { ActionReports } from '../../../../../../../../../../../formsAndLists/actionReports.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/')({
  component: () => (
    <ActionReports from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/" />
  ),
  notFoundComponent: NotFound,
})
