import { createFileRoute } from '@tanstack/react-router'

import { VectorLayerDisplayHistoryCompare } from '../../../../../../../../../formsAndLists/vectorLayerDisplay/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/vector-layers/$vectorLayerId_/displays/$vectorLayerDisplayId_/histories/$vectorLayerDisplayHistoryId')({
  component: VectorLayerDisplayHistoryCompare,
})
