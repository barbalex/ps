import { createFileRoute } from '@tanstack/react-router'

import { Accounts } from '../../../../formsAndLists/accounts.tsx'

export const Route = createFileRoute('/data/_authLayout/accounts/')({
  component: Accounts,
})
