import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReportForm } from '../../../../../../../formsAndLists/subprojectReport/Form.tsx'
import { Filter } from '../../../../../../../components/shared/Filter/index.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/reports/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/reports/filter',
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
