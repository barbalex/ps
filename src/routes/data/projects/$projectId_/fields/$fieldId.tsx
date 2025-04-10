import { createFileRoute } from '@tanstack/react-router'

import { Field } from '../../../../../formsAndLists/field/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/fields/$fieldId',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useFieldNavData',
  }),
})

function RouteComponent() {
  return <Field from="/data/projects/$projectId_/fields/$fieldId" />
}
