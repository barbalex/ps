import { createFileRoute } from '@tanstack/react-router'

import { Filter } from '../../../../../../components/shared/Filter/index.tsx'

const from = '/data/_authLayout/projects/$projectId_/reports/filter'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/reports/filter',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>Hello "/data/_authLayout/projects/$projectId_/reports/filter"!</div>
  )
}
