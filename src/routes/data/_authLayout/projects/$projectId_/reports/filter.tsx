import { createFileRoute } from '@tanstack/react-router'

import { ProjectReportForm } from '../../../../../../formsAndLists/projectReport/Form/index.tsx'
import { Filter } from '../../../../../../components/shared/Filter/index.tsx'

const from = '/data/_authLayout/projects/$projectId_/reports/filter'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/reports/filter',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Filter from={from}>
      {({ row, onChange, orIndex }) => (
        <ProjectReportForm
          row={row}
          onChange={onChange}
          orIndex={orIndex}
          from={from}
        />
      )}
    </Filter>
  )
}
