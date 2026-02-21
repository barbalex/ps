import { createFileRoute } from '@tanstack/react-router'

import { WmsLayerFilter } from '../../../../../formsAndLists/wmsLayer/Filter.tsx'

const from = '/data/projects/$projectId_/wms-layers/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-layers/filter',
)({
  component: () => <WmsLayerFilter from={from} />,
})
