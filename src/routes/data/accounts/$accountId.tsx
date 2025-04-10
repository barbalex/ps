import { createFileRoute } from '@tanstack/react-router'

import { Account } from '../../../formsAndLists/account/index.tsx'

export const Route = createFileRoute('/data/accounts/$accountId')({
  component: Account,
  beforeLoad: () => ({
    navDataFetcher: 'useAccountNavData',
  }),
})
