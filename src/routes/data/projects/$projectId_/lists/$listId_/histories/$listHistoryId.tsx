import { createFileRoute } from '@tanstack/react-router'

import { ListHistoryCompare } from '../../../../../../../formsAndLists/list/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/lists/$listId_/histories/$listHistoryId')({
  component: ListHistoryCompare,
})
