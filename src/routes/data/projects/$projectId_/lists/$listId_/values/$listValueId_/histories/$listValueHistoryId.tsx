import { createFileRoute } from '@tanstack/react-router'

import { ListValueHistoryCompare } from '../../../../../../../../../formsAndLists/listValue/HistoryCompare'

const from =
  '/data/projects/$projectId_/lists/$listId_/values/$listValueId_/histories/$listValueHistoryId'

export const Route = createFileRoute(from)({
  component: () => <ListValueHistoryCompare from={from} />,
})
