import { createFileRoute } from '@tanstack/react-router'

import { Accounts } from '../../../formsAndLists/accounts.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/accounts/')({
  component: Accounts,
  notFoundComponent: NotFound,
})
