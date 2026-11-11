import { createFileRoute } from '@tanstack/react-router'

import { FieldGroups } from '../../../../../formsAndLists/fieldGroups.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/field-groups/',
)({
  component: FieldGroups,
  notFoundComponent: NotFound,
})
