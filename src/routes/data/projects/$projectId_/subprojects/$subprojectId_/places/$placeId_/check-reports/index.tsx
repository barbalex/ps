import { createFileRoute } from '@tanstack/react-router'

import { PlaceCheckReports } from '../../../../../../../../../formsAndLists/placeCheckReports.tsx'
import { NotFound } from '../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceCheckReports from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/" />
  ),
  notFoundComponent: NotFound,
})
