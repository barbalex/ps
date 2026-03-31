import { createFileRoute } from '@tanstack/react-router'

import { ListHistoryCompare } from '../../../../../../../formsAndLists/list/HistoryCompare.tsx'

const from = '/data/projects/$projectId_/lists/$listId_/histories/$listHistoryId'

export const Route = createFileRoute(from)({
  component: ListHistoryCompare,
})
