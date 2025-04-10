import { createFileRoute } from '@tanstack/react-router'

import { UnitForm } from '../../../../../formsAndLists/unit/Form.tsx'
import { Filter } from '../../../../../components/shared/Filter/index.tsx'

const from = '/data/projects/$projectId_/units/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/units/filter',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Filter from={from}>
      {({ row, onChange, orIndex }) => (
        <UnitForm
          row={row}
          onChange={onChange}
          orIndex={orIndex}
          from={from}
        />
      )}
    </Filter>
  )
}
