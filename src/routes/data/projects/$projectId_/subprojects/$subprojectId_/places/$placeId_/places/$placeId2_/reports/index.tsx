import { createFileRoute } from '@tanstack/react-router'

import { PlaceReports } from '../../../../../../../../../../../formsAndLists/placeReports.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceReports from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/" />
  ),
  notFoundComponent: NotFound,
})
