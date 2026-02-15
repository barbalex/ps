import { createFileRoute } from '@tanstack/react-router'

import { ProjectUser } from '../../../../../formsAndLists/projectUser/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/users/$projectUserId/',
)({
  component: ProjectUser,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.projectUserId || params.projectUserId === 'undefined') {
      throw new Error('Invalid or missing projectUserId in route parameters')
    }
    return {
    navDataFetcher: 'useProjectUserNavData',
  }
  },
})
