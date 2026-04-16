import { createFileRoute } from '@tanstack/react-router'

import { QueuedOperation } from '../../../formsAndLists/queuedOperation/index.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/queued-operations/$queuedOperationId',
)({
  component: QueuedOperation,
  notFoundComponent: NotFound,
  beforeLoad: ({ params }) => {
    if (!params.queuedOperationId || params.queuedOperationId === 'undefined') {
      throw new Error(
        'Invalid or missing queuedOperationId in route parameters',
      )
    }
    return {
      navDataFetcher: 'useQueuedOperationNavData',
    }
  },
})
