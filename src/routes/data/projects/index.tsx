import { createFileRoute } from '@tanstack/react-router'

import { Projects } from '../../../formsAndLists/projects.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/')({
  component: Projects,
  notFoundComponent: NotFound,
})
