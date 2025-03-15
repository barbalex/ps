import { createFileRoute } from '@tanstack/react-router'

import { Files } from '../../../../formsAndLists/files.tsx'

const from = '/data/_authLayout/files/'
export const Route = createFileRoute(from)({
  component: RouteComponent,
})

function RouteComponent() {
  return <Files from={from} />
}
