import { createFileRoute } from '@tanstack/react-router'

import { Field } from '../../../../formsAndLists/field/index.tsx'

export const Route = createFileRoute('/data/_authLayout/fields/$fieldId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Field from="/data/_authLayout/fields/$fieldId" />
}
