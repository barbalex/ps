import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReportForm } from '../../../../../../../../../../../formsAndLists/subprojectReport/Form.tsx'
import { Filter } from '../../../../../../../../../../../components/shared/Filter/index.tsx'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/reports/filter'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/reports/filter',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Filter from={from}>
      {({ row, onChange, orIndex }) => (
        <SubprojectReportForm
          row={row}
          onChange={onChange}
          orIndex={orIndex}
          from={from}
        />
      )}
    </Filter>
  )
}
