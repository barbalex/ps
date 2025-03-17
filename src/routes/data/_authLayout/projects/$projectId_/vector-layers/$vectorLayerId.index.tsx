import { createFileRoute } from '@tanstack/react-router'

import { VectorLayer } from '../../../../../../formsAndLists/vectorLayer/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/vector-layers/$vectorLayerId/',
)({
  component: VectorLayer,
})
