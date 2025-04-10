import { createFileRoute } from '@tanstack/react-router'

import { ListForm } from '../../../../../formsAndLists/list/Form.tsx'
import { Filter } from '../../../../../components/shared/Filter/index.tsx'

const from = '/data/projects/$projectId_/lists/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/lists/filter',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Filter from={from}>
      {({ row, onChange, orIndex }) => (
        <ListForm
          row={row}
          onChange={onChange}
          orIndex={orIndex}
          from={from}
        />
      )}
    </Filter>
  )
}
