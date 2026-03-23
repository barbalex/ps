import { createFileRoute } from '@tanstack/react-router'

import { PlaceReportIndex } from '../../../../../../../../../../formsAndLists/placeReport/Index.tsx'
import { NotFound } from '../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/$placeReportId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceReportIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/$placeReportId_/" />
  ),
  notFoundComponent: NotFound,
})
