import { createFileRoute } from '@tanstack/react-router'

import { SubprojectUsers } from '../../../../../../../formsAndLists/subprojectUsers.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/users/',
)({
  component: SubprojectUsers,
  notFoundComponent: NotFound,
})
