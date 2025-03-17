import { createFileRoute } from '@tanstack/react-router'

import { Filter } from '../../../../components/shared/Filter/index.tsx'

const from = '/data/_authLayout/wms-layers/filter'

export const Route = createFileRoute('/data/_authLayout/wms-layers/filter')({
  component: RouteComponent,
})

// TODO: pass isFilter
function RouteComponent() {
  return <div>Hello "/data/_authLayout/wms-layers/filter"!</div>
}
