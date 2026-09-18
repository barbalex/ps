import { createFileRoute } from '@tanstack/react-router'

import { VectorLayerDisplays } from '../../../../../../../formsAndLists/vectorLayerDisplays.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/vector-layers/$vectorLayerId_/displays/')({
  component: () => <VectorLayerDisplays />,
  notFoundComponent: NotFound,
})
