import { createFileRoute } from '@tanstack/react-router'

import { AccountFilter } from '../../../formsAndLists/account/Filter.tsx'

const from = '/data/accounts/filter'

export const Route = createFileRoute(from)({
  component: () => <AccountFilter from={from} />,
})
