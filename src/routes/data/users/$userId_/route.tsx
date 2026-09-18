import { createFileRoute } from '@tanstack/react-router'

import { User } from '../../../../formsAndLists/user/index.tsx'

export const Route = createFileRoute('/data/users/$userId_')({
  component: User,
  beforeLoad: ({ params }) => {
    const userId = params.userId
    if (!userId || userId === 'undefined') {
      throw new Error('Invalid or missing userId in route parameters')
    }
    return {
      navDataFetcher: 'useUserNavData',
    }
  },
})
