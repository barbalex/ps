import { createFileRoute } from '@tanstack/react-router'

import { Files } from '../../../formsAndLists/files.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

const from = '/data/files/'
export const Route = createFileRoute(from)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return <Files from={from} />
}
