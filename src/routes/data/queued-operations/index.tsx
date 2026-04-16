import { createFileRoute } from '@tanstack/react-router'

import { QueuedOperationsList } from '../../../formsAndLists/queuedOperations/List.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/queued-operations/')({
  component: QueuedOperationsList,
  notFoundComponent: NotFound,
})
