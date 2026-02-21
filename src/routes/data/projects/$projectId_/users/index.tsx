import { createFileRoute } from '@tanstack/react-router'

import { ProjectUsers } from '../../../../../formsAndLists/projectUsers.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/users/')({
  component: ProjectUsers,
  notFoundComponent: NotFound,
})
