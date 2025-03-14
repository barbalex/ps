import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/data/_authLayout/files/$fileId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/data/_authLayout/files/$fileId"!</div>
}
