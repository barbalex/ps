import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/wfs-service',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello
      "/data/projects/$projectId_/wfs-services/$wfsServiceId_/wfs-service"!
    </div>
  )
}
