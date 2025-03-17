import { createFileRoute } from '@tanstack/react-router'

import { VectorLayerForm } from '../../../../../../formsAndLists/vectorLayer/Form/index.tsx'
import { Filter } from '../../../../../../components/shared/Filter/index.tsx'

const from = '/data/_authLayout/projects/$projectId_/vector-layers/filter'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/vector-layers/filter',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Filter from={from}>
      {({ row, onChange }) => (
        <VectorLayerForm
          row={row}
          onChange={onChange}
          isFilter={true}
          from={from}
        />
      )}
    </Filter>
  )
}
