import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/wms-layers/$wmsLayerId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/data/_authLayout/wms-layers/$wmsLayerId"!</div>
}
