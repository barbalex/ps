import { createFileRoute } from '@tanstack/react-router'

import { Subproject } from '../../../../../../formsAndLists/subproject/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId/',
)({
  component: Subproject,
})
