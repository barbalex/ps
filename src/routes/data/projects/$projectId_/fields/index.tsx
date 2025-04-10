import { createFileRoute } from '@tanstack/react-router'

import { Fields } from '../../../../../formsAndLists/fields.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/fields/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return <Fields from="/data/projects/$projectId_/fields/" />
}
