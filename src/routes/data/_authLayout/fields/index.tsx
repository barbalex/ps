import { createFileRoute } from '@tanstack/react-router'

import { Fields } from '../../../../formsAndLists/fields.tsx'

const from = '/data/_authLayout/fields/'
export const Route = createFileRoute(from)({
  component: RouteComponent,
})

function RouteComponent() {
  return <Fields from={from} />
}
