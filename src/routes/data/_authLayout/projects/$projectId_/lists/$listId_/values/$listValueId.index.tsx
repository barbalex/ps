import { createFileRoute } from '@tanstack/react-router'

import { ListValue } from '../../../../../../../../formsAndLists/listValue/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/lists/$listId_/values/$listValueId/',
)({
  component: ListValue,
})
