import { createFileRoute } from '@tanstack/react-router'

import { Taxonomies } from '../../../../../formsAndLists/taxonomies.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/taxonomies/')({
  component: Taxonomies,
  notFoundComponent: NotFound,
})
