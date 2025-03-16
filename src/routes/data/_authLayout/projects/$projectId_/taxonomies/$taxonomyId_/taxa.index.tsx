import { createFileRoute } from '@tanstack/react-router'

import { Taxa } from '../../../../../../../formsAndLists/taxa.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/taxonomies/$taxonomyId_/taxa/',
)({
  component: Taxa,
})
