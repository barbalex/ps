import { createFileRoute } from '@tanstack/react-router'

import { PlaceCheckReportIndex } from '../../../../../../../../../../formsAndLists/placeCheckReport/Index.tsx'
import { NotFound } from '../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$placeReportId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceCheckReportIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$placeReportId_/" />
  ),
  notFoundComponent: NotFound,
})
