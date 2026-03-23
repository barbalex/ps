import { createFileRoute } from '@tanstack/react-router'

import { PlaceReportList } from '../../../../../../../../../../../../formsAndLists/placeReport/List.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/$placeReportId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceReportList from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/$placeReportId_/" />
  ),
})
