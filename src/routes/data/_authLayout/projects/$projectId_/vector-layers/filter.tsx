import { createFileRoute } from '@tanstack/react-router'

import { Filter } from '../../../../../../components/shared/Filter/index.tsx'

const from = '/data/_authLayout/projects/$projectId_/vector-layers/filter'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/vector-layers/filter',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/data/_authLayout/projects/$projectId_/vector-layers/filter"!
    </div>
  )
}
