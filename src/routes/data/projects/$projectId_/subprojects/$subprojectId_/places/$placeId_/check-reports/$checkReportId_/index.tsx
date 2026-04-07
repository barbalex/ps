import { createFileRoute } from '@tanstack/react-router'

import { CheckReportIndex } from '../../../../../../../../../../formsAndLists/checkReport/index.tsx'
import { NotFound } from '../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$checkReportId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <CheckReportIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$checkReportId_/" />
  ),
  notFoundComponent: NotFound,
})
