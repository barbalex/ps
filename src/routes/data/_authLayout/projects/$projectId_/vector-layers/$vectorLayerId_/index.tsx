import { createFileRoute } from '@tanstack/react-router'

import { VectorLayerList } from '../../../../../../../formsAndLists/vectorLayer/List.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/vector-layers/$vectorLayerId_/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <VectorLayerList from="/data/_authLayout/projects/$projectId_/vector-layers/$vectorLayerId_/" />
  )
}
