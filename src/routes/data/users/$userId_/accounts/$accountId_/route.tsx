import { createFileRoute, redirect } from '@tanstack/react-router'
import { Account } from '../../../../../../formsAndLists/account/index.tsx'

export const Route = createFileRoute(
  '/data/users/$userId_/accounts/$accountId_',
)({
  component: Account,
  beforeLoad: ({ params }) => {
    const userId = params.userId
    const accountId = params.accountId
    if (!userId || userId === 'undefined') {
      throw redirect({ to: '/data/users' })
    }
    if (!accountId || accountId === 'undefined') {
      throw redirect({
        to: '/data/users/$userId/accounts',
        params: { userId },
      })
    }
    return {
      navDataFetcher: 'useAccountNavData',
    }
  },
})
