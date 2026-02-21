import { createFileRoute } from '@tanstack/react-router'

import { PlaceReportValues } from '../../../../../../../../../../../formsAndLists/placeReportValues.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/reports/values/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceReportValues from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/reports/values/" />
  ),
  notFoundComponent: NotFound,
})
