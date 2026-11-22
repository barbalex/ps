import { createFileRoute } from '@tanstack/react-router'

import { WmsLayer } from '../../../../../../formsAndLists/wmsLayer/index.tsx'
import { NotFound } from '../../../../../../components/NotFound.tsx'

// the nav tree links WMS-layer rows to this bare path, the lists and headers
// to the sibling /wms-layer path — both render the form
export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-layers/$wmsLayerId_/',
)({
  component: WmsLayer,
  notFoundComponent: NotFound,
})
