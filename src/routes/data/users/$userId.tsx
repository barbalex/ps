import { createFileRoute } from '@tanstack/react-router'

import { User } from '../../../formsAndLists/user/index.tsx'

export const Route = createFileRoute('/data/users/$userId')({
  component: User,
  beforeLoad: ({ params }) => {
    if (!params.userId || params.userId === 'undefined') {
      throw new Error('Invalid or missing userId in route parameters')
    }
    return {
      navDataFetcher: 'useUserNavData',
    }
  },
})
