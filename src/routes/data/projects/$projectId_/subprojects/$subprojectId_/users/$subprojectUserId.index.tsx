import { createFileRoute } from '@tanstack/react-router'

import { SubprojectUser } from '../../../../../../../formsAndLists/subprojectUser/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/users/$subprojectUserId/',
)({
  component: SubprojectUser,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.subprojectId_ || params.subprojectId_ === 'undefined') {
      throw new Error('Invalid or missing subprojectId_ in route parameters')
    }
    if (!params.subprojectUserId || params.subprojectUserId === 'undefined') {
      throw new Error('Invalid or missing subprojectUserId in route parameters')
    }
    return {
    navDataFetcher: 'useSubprojectUserNavData',
  }
  },
})
