import { createFileRoute } from '@tanstack/react-router'

import { CheckReports } from '../../../../../../../../../../formsAndLists/checkReports.tsx'
import { NotFound } from '../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/check-reports/'

export const Route = createFileRoute(from)({
  component: () => (
    <CheckReports from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/check-reports/" />
  ),
  notFoundComponent: NotFound,
})
