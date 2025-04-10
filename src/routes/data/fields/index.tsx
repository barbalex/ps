import { createFileRoute } from '@tanstack/react-router'

import { Fields } from '../../../formsAndLists/fields.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

const from = '/data/fields/'

export const Route = createFileRoute(from)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return <Fields from={from} />
}
