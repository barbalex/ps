import { createFileRoute } from '@tanstack/react-router'

import { CheckReportQuantities } from '../../../../../../../../../../../formsAndLists/checkReportQuantities.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$checkReportId_/quantities/'

export const Route = createFileRoute(from)({
  component: () => (
    <CheckReportQuantities
      from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$checkReportId_/quantities/"
      hideTitle={true}
    />
  ),
  notFoundComponent: NotFound,
})
