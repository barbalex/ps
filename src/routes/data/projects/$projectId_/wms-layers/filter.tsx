import { createFileRoute } from '@tanstack/react-router'

import { WmsLayerForm } from '../../../../../formsAndLists/wmsLayer/Form/index.tsx'
import { Filter } from '../../../../../components/shared/Filter/index.tsx'

const from = '/data/projects/$projectId_/wms-layers/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-layers/filter',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Filter from={from}>
      {({ row, onChange }) => (
        <WmsLayerForm
          row={row}
          onChange={onChange}
          isFilter={true}
          from={from}
        />
      )}
    </Filter>
  )
}
