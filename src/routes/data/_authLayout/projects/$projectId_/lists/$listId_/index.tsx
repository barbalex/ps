import { createFileRoute } from '@tanstack/react-router'

import { ListList } from '../../../../../../../formsAndLists/list/List.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/lists/$listId_/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ListList from="/data/_authLayout/projects/$projectId_/lists/$listId_/" />
  )
}
