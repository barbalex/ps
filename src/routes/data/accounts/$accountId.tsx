import { createFileRoute } from '@tanstack/react-router'

import { Account } from '../../../formsAndLists/account/index.tsx'

export const Route = createFileRoute('/data/accounts/$accountId')({
  component: Account,
  beforeLoad: ({ params }) => {
    if (!params.accountId || params.accountId === 'undefined') {
      throw new Error('Invalid or missing accountId in route parameters')
    }
    return {
      navDataFetcher: 'useAccountNavData',
    }
  },
})
