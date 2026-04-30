import { createFileRoute } from '@tanstack/react-router'

import { ProjectOwnQcs } from '../../../../../formsAndLists/projectOwnQcs.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/project-qcs/')(
  {
    component: ProjectOwnQcs,
    notFoundComponent: NotFound,
  },
)
