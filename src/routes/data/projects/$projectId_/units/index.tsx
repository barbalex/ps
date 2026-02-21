import { createFileRoute } from '@tanstack/react-router'

import { Units } from '../../../../../formsAndLists/units.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/units/')({
  component: Units,
  notFoundComponent: NotFound,
})
