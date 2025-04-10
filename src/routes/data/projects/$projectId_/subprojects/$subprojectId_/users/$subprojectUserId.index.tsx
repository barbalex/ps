import { createFileRoute } from '@tanstack/react-router'

import { SubprojectUser } from '../../../../../../../formsAndLists/subprojectUser/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/users/$subprojectUserId/',
)({
  component: SubprojectUser,
  beforeLoad: () => ({
    navDataFetcher: 'useSubprojectUserNavData',
  }),
})
