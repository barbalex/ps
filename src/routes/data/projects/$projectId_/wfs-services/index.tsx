import { createFileRoute } from '@tanstack/react-router'

import { WfsServices } from '../../../../../formsAndLists/wfsServices.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wfs-services/',
)({
  component: WfsServices,
  notFoundComponent: NotFound,
})
