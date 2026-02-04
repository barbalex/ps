import { createFileRoute } from '@tanstack/react-router'

import { WmsServices } from '../../../../../formsAndLists/wmsServices.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-services/',
)({
  component: WmsServices,
  notFoundComponent: NotFound,
})
