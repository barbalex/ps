import { createFileRoute } from '@tanstack/react-router'

import { PlaceReportValue } from '../../../../../../../../../../../formsAndLists/placeReportValue/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/reports/values/$placeReportValueId'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceReportValue from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/reports/values/$placeReportValueId" />
  ),
})
