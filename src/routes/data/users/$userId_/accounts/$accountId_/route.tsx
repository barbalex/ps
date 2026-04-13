import { createFileRoute } from '@tanstack/react-router'
import { Account } from '../../../../../../formsAndLists/account'

export const Route = createFileRoute('/data/users/$userId_/accounts/$accountId_')({
  component: Account,
  beforeLoad: ({ params }) => {
    if (!params.userId || params.userId === 'undefined') {
      throw new Error('Invalid or missing userId in route parameters')
    }
    if (!params.accountId || params.accountId === 'undefined') {
      throw new Error('Invalid or missing accountId in route parameters')
    }
    return {
      navDataFetcher: 'useAccountNavData',
    }
  },
})
