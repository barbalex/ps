import { createFileRoute } from '@tanstack/react-router'

import { VectorLayerDisplayHistoryCompare } from '../../../../../../../../../formsAndLists/vectorLayerDisplay/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/vector-layers/$vectorLayerId_/displays/$vectorLayerDisplayId_/histories/$vectorLayerDisplayHistoryId'

export const Route = createFileRoute(from)({
  component: VectorLayerDisplayHistoryCompare,
})
