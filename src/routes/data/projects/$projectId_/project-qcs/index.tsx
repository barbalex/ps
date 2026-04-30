import { createFileRoute } from '@tanstack/react-router'

import { ProjectQcs } from '../../../../../formsAndLists/projectQcs.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/project-qcs/')(
  {
    component: ProjectQcs,
    notFoundComponent: NotFound,
  },
)
