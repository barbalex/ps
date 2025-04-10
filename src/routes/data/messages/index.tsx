import { createFileRoute } from '@tanstack/react-router'

import { Messages } from '../../../formsAndLists/messages.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/messages/')({
  component: Messages,
  notFoundComponent: NotFound,
})
