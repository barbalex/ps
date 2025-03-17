import { createFileRoute } from '@tanstack/react-router'

import { ProjectUsers } from '../../../../../../formsAndLists/projectUsers.tsx'
import { NotFound } from '../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/users/',
)({
  component: ProjectUsers,
  notFoundComponent: NotFound,
})
