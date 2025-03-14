import { createFileRoute } from '@tanstack/react-router'

import { Field } from '../../../../formsAndLists/field/index.tsx'

const from = '/data/_authLayout/fields/$fieldId'
export const Route = createFileRoute(from)({
  component: RouteComponent,
})

function RouteComponent() {
  return <Field from={from} />
}
