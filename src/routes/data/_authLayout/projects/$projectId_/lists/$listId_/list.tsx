import { createFileRoute } from '@tanstack/react-router'

import { List } from '../../../../../../../formsAndLists/list/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/lists/$listId_/list',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <List from="/data/_authLayout/projects/$projectId_/lists/$listId_/list" />
  )
}
