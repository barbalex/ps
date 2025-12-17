import { createFileRoute } from '@tanstack/react-router'

import { QueuedOperations } from '../../../formsAndLists/queuedOperations/index.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/queued-operations/')({
  component: QueuedOperations,
  notFoundComponent: NotFound,
})
