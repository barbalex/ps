import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/data/_authLayout/fields/$fieldId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/data/_authLayout/fields/$fieldId"!</div>
}
