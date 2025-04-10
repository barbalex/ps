import { createFileRoute } from '@tanstack/react-router'

import { VectorLayerDisplay } from '../../../../../../../formsAndLists/vectorLayerDisplay/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/vector-layers/$vectorLayerId_/displays/$vectorLayerDisplayId',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useVectorLayerDisplayNavData',
  }),
})

function RouteComponent() {
  return (
    <VectorLayerDisplay from="/data/projects/$projectId_/vector-layers/$vectorLayerId_/displays/$vectorLayerDisplayId" />
  )
}
