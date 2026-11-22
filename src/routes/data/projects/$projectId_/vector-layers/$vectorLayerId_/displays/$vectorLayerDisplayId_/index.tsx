import { createFileRoute } from '@tanstack/react-router'

import { VectorLayerDisplay } from '../../../../../../../../formsAndLists/vectorLayerDisplay/index.tsx'
import { NotFound } from '../../../../../../../../components/NotFound.tsx'

// the nav tree links display rows to this bare path, the displays list to the
// sibling /vector-layer-display path — both render the form
export const Route = createFileRoute(
  '/data/projects/$projectId_/vector-layers/$vectorLayerId_/displays/$vectorLayerDisplayId_/',
)({
  component: () => <VectorLayerDisplay />,
  notFoundComponent: NotFound,
})
