import { createFileRoute, redirect } from '@tanstack/react-router'
import { Account } from '../../../../../../formsAndLists/account/index.tsx'

export const Route = createFileRoute(
  '/data/users/$userId_/accounts/$accountId_',
)({
  component: Account,
  beforeLoad: ({ params }) => {
    const userId = params.userId ?? params.userId_
    const accountId = params.accountId ?? params.accountId_
    if (!userId || userId === 'undefined') {
      throw redirect({ to: '/data/users' })
    }
    if (!accountId || accountId === 'undefined') {
      throw redirect({
        to: '/data/users/$userId_/accounts/',
        params: { userId },
      })
    }
    return {
      navDataFetcher: 'useAccountNavData',
    }
  },
})
