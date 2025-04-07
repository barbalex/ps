import { createFileRoute } from '@tanstack/react-router'

import { User } from '../../../../formsAndLists/user/index.tsx'

export const Route = createFileRoute('/data/_authLayout/users/$userId')({
  component: User,
  beforeLoad: () => ({
    navDataFetcher: 'useUserNavData',
  }),
})
