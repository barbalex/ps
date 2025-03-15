import { createFileRoute } from '@tanstack/react-router'

import { Files } from '../../../../formsAndLists/files.tsx'
import { NotFound } from '../../../../components/NotFound.tsx'

const from = '/data/_authLayout/files/'
export const Route = createFileRoute(from)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return <Files from={from} />
}
