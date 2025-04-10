import { createFileRoute } from '@tanstack/react-router'

import { Users } from '../../../formsAndLists/users.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/users/')({
  component: Users,
  notFoundComponent: NotFound,
})
