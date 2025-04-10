import { createFileRoute } from '@tanstack/react-router'

import { PlaceReportForm } from '../../../../../../../../../formsAndLists/placeReport/Form.tsx'
import { Filter } from '../../../../../../../../../components/shared/Filter/index.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/filter',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Filter
      level={1}
      from={from}
    >
      {({ row, onChange, orIndex }) => (
        <PlaceReportForm
          row={row}
          onChange={onChange}
          orIndex={orIndex}
          from={from}
        />
      )}
    </Filter>
  )
}
