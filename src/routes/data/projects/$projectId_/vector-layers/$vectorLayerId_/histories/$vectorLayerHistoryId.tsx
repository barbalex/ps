import { createFileRoute } from '@tanstack/react-router'

import { VectorLayerHistoryCompare } from '../../../../../../../formsAndLists/vectorLayer/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/vector-layers/$vectorLayerId_/histories/$vectorLayerHistoryId'

export const Route = createFileRoute(from)({
  component: VectorLayerHistoryCompare,
})
