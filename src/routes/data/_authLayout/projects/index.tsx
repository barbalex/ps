import { createFileRoute } from '@tanstack/react-router'

import { ProjectsChooser } from '../../../../formsAndLists/projects/index.tsx'
import { NotFound } from '../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/_authLayout/projects/')({
  component: ProjectsChooser,
  notFoundComponent: NotFound,
})
