import { createFileRoute } from '@tanstack/react-router'

import { ListList } from '../../../../../../formsAndLists/list/List.tsx'
const from = '/data/projects/$projectId_/lists/$listId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <ListList from="/data/projects/$projectId_/lists/$listId_/" />
  ),
})
