import { createFileRoute } from '@tanstack/react-router'

import { FieldGroupsTables } from '../../../../../formsAndLists/fieldGroupsTables.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/field-groups/',
)({
  component: FieldGroupsTables,
  notFoundComponent: NotFound,
})
