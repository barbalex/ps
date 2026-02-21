import { createFileRoute } from '@tanstack/react-router'

import { ProjectUser } from '../../../../../formsAndLists/projectUser/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/users/$projectUserId/',
)({
  component: ProjectUser,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.projectUserId || params.projectUserId === 'undefined') {
      throw new Error('Invalid or missing projectUserId in route parameters')
    }
    return {
      navDataFetcher: 'useProjectUserNavData',
    }
  },
})
