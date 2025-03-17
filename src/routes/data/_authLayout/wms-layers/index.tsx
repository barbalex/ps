import { createFileRoute } from '@tanstack/react-router'

const from = '/data/_authLayout/wms-layers/'

export const Route = createFileRoute('/data/_authLayout/wms-layers/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/data/_authLayout/wms-layers/"!</div>
}
