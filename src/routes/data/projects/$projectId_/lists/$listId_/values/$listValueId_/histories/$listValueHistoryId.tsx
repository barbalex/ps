import { createFileRoute } from '@tanstack/react-router'

import { ListValueHistoryCompare } from '../../../../../../../../../formsAndLists/listValue/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/lists/$listId_/values/$listValueId_/histories/$listValueHistoryId'

export const Route = createFileRoute(
  '/data/projects/$projectId_/lists/$listId_/values/$listValueId_/histories/$listValueHistoryId',
)({
  component: () => <ListValueHistoryCompare from={from} />,
})
