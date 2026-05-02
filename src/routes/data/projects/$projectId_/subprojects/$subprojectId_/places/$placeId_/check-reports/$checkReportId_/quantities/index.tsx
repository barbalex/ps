import { createFileRoute } from '@tanstack/react-router'

import { CheckReportQuantities } from '../../../../../../../../../../../formsAndLists/checkReportQuantities.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$checkReportId_/quantities/')({
  component: () => (
    <CheckReportQuantities
      from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$checkReportId_/quantities/"
      hideTitle={true}
    />
  ),
  notFoundComponent: NotFound,
})
