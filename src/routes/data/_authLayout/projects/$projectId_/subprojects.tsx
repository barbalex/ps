import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/data/_authLayout/projects/$projectId/subprojects"!</div>
}
