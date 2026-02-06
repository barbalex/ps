import { createFileRoute } from '@tanstack/react-router'

import { WfsServiceLayer } from '../../../../../../../formsAndLists/wfsServiceLayer/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/layers/$wfsServiceLayerId/',
)({
  component: WfsServiceLayer,
  beforeLoad: () => ({
    navDataFetcher: 'useWfsServiceLayerNavData',
  }),
})
