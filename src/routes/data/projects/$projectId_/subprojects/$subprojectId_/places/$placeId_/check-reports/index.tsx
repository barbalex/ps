import { createFileRoute } from '@tanstack/react-router'

import { CheckReports } from '../../../../../../../../../formsAndLists/checkReports.tsx'
import { NotFound } from '../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/')({
  component: () => (
    <CheckReports from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/" />
  ),
  notFoundComponent: NotFound,
})
