import { createFileRoute } from '@tanstack/react-router'

import { ProjectUser } from '../../../../../../formsAndLists/projectUser/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/users/$projectUserId/',
)({
  component: ProjectUser,
  beforeLoad: () => ({
    navDataFetcher: 'useProjectUserNavData',
  }),
})
