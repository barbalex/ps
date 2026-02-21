import { createFileRoute } from '@tanstack/react-router'

import { VectorLayerFilter } from '../../../../../formsAndLists/vectorLayer/Filter.tsx'

const from = '/data/projects/$projectId_/vector-layers/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/vector-layers/filter',
)({
  component: () => <VectorLayerFilter from={from} />,
})
